'use client';

import { useCallback, useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as api from '@/lib/api';
import type { Org, OrgInput, PeerEntry } from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnDataTable, type DataTableColumn, MnBadge } from '@/components/maranello/data-display';
import { MnOrgChart, type OrgNode } from '@/components/maranello/network';
import { MnBudgetTreemap, type TreemapItem } from '@/components/maranello/data-viz';
import { MnModal } from '@/components/maranello/feedback';
import { MnFormField } from '@/components/maranello/forms';
import { MnProgressRing } from '@/components/maranello/data-display';
import { MnStateScaffold } from '@/components/maranello/feedback';

const ORG_COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'agent_count', label: 'Agents', sortable: true },
  { key: 'budget_usd', label: 'Budget ($)', sortable: true },
  { key: 'spent_usd', label: 'Spent ($)', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
];

export default function OrgsPage() {
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<OrgInput>({ name: '', budget_usd: 0 });
  const [saving, setSaving] = useState(false);

  const { data: orgs, loading, error, refetch } = useApiQuery<Org[]>(api.orgList);
  const { data: peers } = useApiQuery<PeerEntry[]>(
    () => selectedOrg ? api.tenancyPeers(selectedOrg.id) : Promise.resolve([]),
    { enabled: !!selectedOrg },
  );

  const orgTree: OrgNode = useMemo(() => ({
    name: 'Convergio Platform',
    role: 'Root',
    status: 'active',
    children: (orgs ?? []).map((o) => ({
      name: o.name,
      role: o.description ?? 'Organization',
      status: o.status === 'active' ? 'active' : o.status === 'suspended' ? 'error' : 'inactive' as const,
    })),
  }), [orgs]);

  const budgetItems: TreemapItem[] = useMemo(
    () => (orgs ?? []).map((o) => ({ name: o.name, value: o.spent_usd })),
    [orgs],
  );

  const handleCreate = useCallback(async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      await api.orgCreate(formData);
      setShowCreate(false);
      setFormData({ name: '', budget_usd: 0 });
      refetch();
    } finally {
      setSaving(false);
    }
  }, [formData, refetch]);

  const handleDelete = useCallback(async (org: Org) => {
    if (!confirm(`Delete organization "${org.name}"?`)) return;
    await api.orgDelete(org.id);
    setSelectedOrg(null);
    refetch();
  }, [refetch]);

  if (loading) return <MnStateScaffold state="loading" message="Loading organizations..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Organization
        </button>
      </div>

      <MnSectionCard title="All Organizations" badge={(orgs ?? []).length} collapsible defaultOpen>
        <MnDataTable
          columns={ORG_COLUMNS}
          data={(orgs ?? []) as unknown as Record<string, unknown>[]}
          onRowClick={(row) => setSelectedOrg(row as unknown as Org)}
          emptyMessage="No organizations found"
        />
      </MnSectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Org Chart" collapsible defaultOpen>
          <div className="p-4">
            <MnOrgChart
              tree={orgTree}
              onNodeClick={(node) => {
                const found = (orgs ?? []).find((o) => o.name === node.name);
                if (found) setSelectedOrg(found);
              }}
              ariaLabel="Organization hierarchy"
            />
          </div>
        </MnSectionCard>

        <MnSectionCard title="Budget Distribution" collapsible defaultOpen>
          <div className="p-4">
            {budgetItems.length > 0 ? (
              <MnBudgetTreemap items={budgetItems} ariaLabel="Budget by organization" />
            ) : (
              <p className="text-sm text-muted-foreground">No budget data</p>
            )}
          </div>
        </MnSectionCard>

        {selectedOrg && (
          <MnSectionCard
            title={selectedOrg.name}
            collapsible
            defaultOpen
            action={{ label: 'Delete', onClick: () => handleDelete(selectedOrg) }}
          >
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <MnBadge tone={selectedOrg.status === 'active' ? 'success' : 'danger'}>
                  {selectedOrg.status}
                </MnBadge>
                <span className="text-sm text-muted-foreground">{selectedOrg.description}</span>
              </div>
              <div className="flex items-center gap-6">
                <MnProgressRing
                  value={selectedOrg.spent_usd}
                  max={selectedOrg.budget_usd}
                  size="md"
                  label="Budget usage"
                />
                <div>
                  <p className="text-sm font-medium">
                    ${selectedOrg.spent_usd.toFixed(2)} / ${selectedOrg.budget_usd.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedOrg.agent_count} agents</p>
                </div>
              </div>
            </div>
          </MnSectionCard>
        )}

        {selectedOrg && (
          <MnSectionCard title="Inter-Org Peers" collapsible defaultOpen>
            <div className="space-y-2 p-4">
              {(peers ?? []).length > 0 ? (
                (peers ?? []).map((p) => (
                  <div key={p.peer_name} className="flex items-center justify-between border-b border-border py-2">
                    <span className="text-sm font-medium">{p.peer_name}</span>
                    <MnBadge tone={p.allowed ? 'success' : 'danger'}>
                      {p.allowed ? 'Allowed' : 'Blocked'}
                    </MnBadge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No peer connections</p>
              )}
            </div>
          </MnSectionCard>
        )}
      </div>

      <MnModal open={showCreate} onOpenChange={setShowCreate} title="New Organization">
        <div className="space-y-4 p-4">
          <MnFormField label="Name" required error={!formData.name && saving ? 'Required' : undefined}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="e.g. Legal Corp"
            />
          </MnFormField>
          <MnFormField label="Description">
            <input
              type="text"
              value={formData.description ?? ''}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Legal research division"
            />
          </MnFormField>
          <MnFormField label="Budget (USD)">
            <input
              type="number"
              value={formData.budget_usd}
              onChange={(e) => setFormData((f) => ({ ...f, budget_usd: Number(e.target.value) }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              min={0}
              step={10}
            />
          </MnFormField>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </MnModal>
    </div>
  );
}
