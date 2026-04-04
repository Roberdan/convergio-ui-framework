'use client';

import { useCallback, useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import type { PlanDb, ExecutionTree } from '@/lib/types';
import { planDbList, planDbCreate, planDbExecutionTree } from '@/lib/api-ext';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnDataTable, type DataTableColumn, MnBadge, MnProgressRing } from '@/components/maranello/data-display';
import { MnModal, MnStateScaffold } from '@/components/maranello/feedback';
import { MnFormField } from '@/components/maranello/forms';

const PLAN_COLS: DataTableColumn[] = [
  { key: 'name', label: 'Plan', sortable: true },
  { key: 'project_id', label: 'Project', sortable: true },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'tasks_done', label: 'Done', sortable: true },
  { key: 'tasks_total', label: 'Total', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  done: 'success', completed: 'success', in_progress: 'info', pending: 'neutral',
  submitted: 'warning', failed: 'danger', cancelled: 'danger',
};

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanDb | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', project_id: 'default' });
  const [saving, setSaving] = useState(false);
  const [expandedWaves, setExpandedWaves] = useState<Set<number>>(new Set());

  const { data: plans, loading, error, refetch } = useApiQuery<PlanDb[]>(() => planDbList());
  const { data: tree } = useApiQuery<ExecutionTree>(
    () => selectedPlan ? planDbExecutionTree(selectedPlan.id) : Promise.resolve(null as unknown as ExecutionTree),
    { enabled: !!selectedPlan },
  );

  const toggleWave = useCallback((id: number) => {
    setExpandedWaves((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      await planDbCreate(formData.name, formData.project_id || 'default');
      setShowCreate(false);
      setFormData({ name: '', project_id: 'default' });
      refetch();
    } finally {
      setSaving(false);
    }
  }, [formData, refetch]);

  if (loading) return <MnStateScaffold state="loading" message="Loading plans..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plans & Tasks</h1>
        <button onClick={() => setShowCreate(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          New Plan
        </button>
      </div>

      <MnSectionCard title="All Plans" badge={(plans ?? []).length} collapsible defaultOpen>
        <MnDataTable
          columns={PLAN_COLS}
          data={(plans ?? []) as unknown as Record<string, unknown>[]}
          onRowClick={(row) => { setSelectedPlan(row as unknown as PlanDb); setExpandedWaves(new Set()); }}
          emptyMessage="No plans found"
        />
      </MnSectionCard>

      {selectedPlan && tree && (
        <MnSectionCard title={`${tree.plan.name} — Execution Tree`} collapsible defaultOpen>
          <div className="space-y-1 p-4">
            <div className="mb-3 flex items-center gap-3">
              <MnProgressRing value={tree.plan.tasks_done} max={tree.plan.tasks_total || 1} size="sm" label="Progress" />
              <span className="text-sm">{tree.plan.tasks_done}/{tree.plan.tasks_total} tasks</span>
              <MnBadge tone={STATUS_TONE[tree.plan.status] ?? 'neutral'}>{tree.plan.status}</MnBadge>
            </div>
            {tree.waves.map((wave) => (
              <div key={wave.id} className="rounded-md border">
                <button onClick={() => toggleWave(wave.id)}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50">
                  <span className="text-sm font-medium">{wave.name || `Wave ${wave.wave_id}`}</span>
                  <div className="flex items-center gap-2">
                    <MnBadge tone={STATUS_TONE[wave.status] ?? 'neutral'}>{wave.status}</MnBadge>
                    <span className="text-xs">{expandedWaves.has(wave.id) ? '▼' : '▶'}</span>
                  </div>
                </button>
                {expandedWaves.has(wave.id) && (
                  <div className="border-t p-3">
                    <p className="text-xs text-muted-foreground">ID: {wave.wave_id}</p>
                  </div>
                )}
              </div>
            ))}
            {tree.waves.length === 0 && (
              <p className="text-sm text-muted-foreground">No waves in this plan</p>
            )}
          </div>
        </MnSectionCard>
      )}

      <MnModal open={showCreate} onOpenChange={setShowCreate} title="Create Plan">
        <div className="space-y-4 p-4">
          <MnFormField label="Name" required>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g. Q2 Migration" />
          </MnFormField>
          <MnFormField label="Project ID">
            <input type="text" value={formData.project_id}
              onChange={(e) => setFormData((f) => ({ ...f, project_id: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="default" />
          </MnFormField>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </MnModal>
    </div>
  );
}
