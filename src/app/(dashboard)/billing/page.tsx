'use client';

import { useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as api from '@/lib/api';
import type { UsageResponse, Invoice, RateCard, Org } from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnDataTable, type DataTableColumn, MnBadge } from '@/components/maranello/data-display';
import { MnBudgetTreemap, type TreemapItem } from '@/components/maranello/data-viz';
import { MnChart } from '@/components/maranello/data-viz';
import { MnStateScaffold } from '@/components/maranello/feedback';

const INVOICE_COLS: DataTableColumn[] = [
  { key: 'id', label: 'Invoice', sortable: true },
  { key: 'amount', label: 'Amount ($)', sortable: true },
  { key: 'currency', label: 'Currency' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'period_start', label: 'Period Start', sortable: true },
  { key: 'period_end', label: 'Period End', sortable: true },
];

const RATE_COLS: DataTableColumn[] = [
  { key: 'capability', label: 'Capability', sortable: true },
  { key: 'unit', label: 'Unit' },
  { key: 'rate', label: 'Rate ($)', sortable: true },
];

export default function BillingPage() {
  const [selectedOrg, setSelectedOrg] = useState('');

  const { data: orgs } = useApiQuery<Org[]>(api.orgList);
  const { data: usage, loading, error, refetch } = useApiQuery<UsageResponse>(
    () => selectedOrg ? api.billingUsage({ org_id: selectedOrg }) : Promise.reject(new Error('no org')),
    { enabled: !!selectedOrg, pollInterval: 10_000 },
  );
  const { data: invoices } = useApiQuery<Invoice[]>(
    () => selectedOrg ? api.billingInvoices(selectedOrg) : Promise.resolve([]),
    { enabled: !!selectedOrg, pollInterval: 60_000 },
  );
  const { data: rates } = useApiQuery<RateCard[]>(
    () => selectedOrg ? api.billingRates(selectedOrg) : Promise.resolve([]),
    { enabled: !!selectedOrg, pollInterval: 60_000 },
  );

  const budgetItems: TreemapItem[] = useMemo(
    () => (orgs ?? []).map((o) => ({ name: o.name, value: o.spent_usd })),
    [orgs],
  );

  const categoryLabels = useMemo(() => (usage?.categories ?? []).map((c) => c.category), [usage]);
  const categorySeries = useMemo(() => [{
    label: 'Cost ($)',
    data: (usage?.categories ?? []).map((c) => c.cost),
    color: 'var(--mn-accent)',
  }], [usage]);

  if (!selectedOrg) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Billing</h1>
        <MnSectionCard title="Budget Hierarchy" collapsible defaultOpen>
          <div className="p-4">
            {budgetItems.length > 0 ? (
              <MnBudgetTreemap items={budgetItems} ariaLabel="Budget by org" />
            ) : (
              <MnStateScaffold state="empty" message="No organizations" />
            )}
          </div>
        </MnSectionCard>
        <MnSectionCard title="Select Organization" collapsible defaultOpen>
          <div className="space-y-2 p-4">
            {(orgs ?? []).map((o) => (
              <button key={o.id} onClick={() => setSelectedOrg(o.id)}
                className="flex w-full items-center justify-between rounded-md border p-3 text-left hover:bg-muted/50">
                <span className="text-sm font-medium">{o.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">${o.spent_usd.toFixed(2)} / ${o.budget_usd.toFixed(2)}</span>
                  <MnBadge tone={o.status === 'active' ? 'success' : 'danger'}>{o.status}</MnBadge>
                </div>
              </button>
            ))}
            {(orgs ?? []).length === 0 && <p className="text-sm text-muted-foreground">No organizations found</p>}
          </div>
        </MnSectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Billing</h1>
          <MnBadge tone="info">{(orgs ?? []).find((o) => o.id === selectedOrg)?.name ?? selectedOrg}</MnBadge>
        </div>
        <button onClick={() => setSelectedOrg('')} className="rounded-md border px-3 py-1 text-sm hover:bg-muted/50">
          All Orgs
        </button>
      </div>

      {loading && <MnStateScaffold state="loading" message="Loading billing data..." />}
      {error && <MnStateScaffold state="error" message={error} onRetry={refetch} />}

      {usage && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <KpiCard label="Daily Cost" value={`$${usage.daily_cost.toFixed(2)}`} />
          <KpiCard label="Monthly Cost" value={`$${usage.monthly_cost.toFixed(2)}`} />
          <KpiCard label="Categories" value={usage.categories.length} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Cost by Category" collapsible defaultOpen>
          <div className="p-4">
            {categoryLabels.length > 0 ? (
              <MnChart type="bar" labels={categoryLabels} series={categorySeries} showLegend={false} />
            ) : (
              <p className="text-sm text-muted-foreground">No category data</p>
            )}
          </div>
        </MnSectionCard>

        <MnSectionCard title="Rate Cards" badge={(rates ?? []).length} collapsible defaultOpen>
          <MnDataTable
            columns={RATE_COLS}
            data={(rates ?? []) as unknown as Record<string, unknown>[]}
            emptyMessage="No rate cards"
          />
        </MnSectionCard>
      </div>

      <MnSectionCard title="Invoices" badge={(invoices ?? []).length} collapsible defaultOpen>
        <MnDataTable
          columns={INVOICE_COLS}
          data={(invoices ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No invoices"
        />
      </MnSectionCard>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
