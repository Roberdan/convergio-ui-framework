'use client';

import { useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as api from '@/lib/api';
import type { CostSummary, RoutingResponse } from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnDataTable, type DataTableColumn, MnBadge } from '@/components/maranello/data-display';
import { MnChart } from '@/components/maranello/data-viz';
import { MnStateScaffold } from '@/components/maranello/feedback';
import { MnFormField } from '@/components/maranello/forms';

const COST_COLS: DataTableColumn[] = [
  { key: 'entity_id', label: 'Entity', sortable: true },
  { key: 'entity_type', label: 'Type', sortable: true },
  { key: 'model', label: 'Model', sortable: true },
  { key: 'daily_cost', label: 'Daily ($)', sortable: true },
  { key: 'monthly_cost', label: 'Monthly ($)', sortable: true },
];

export default function InferencePage() {
  const [routingPrompt, setRoutingPrompt] = useState('');
  const [routingTier, setRoutingTier] = useState('');

  const { data: costs, loading, error, refetch } = useApiQuery<CostSummary[]>(
    () => api.inferenceCosts({}),
    { pollInterval: 30_000 },
  );

  const { data: routing } = useApiQuery<RoutingResponse>(
    () => api.inferenceRouting({
      prompt: routingPrompt || undefined,
      tier: routingTier || undefined,
    }),
    { enabled: !!routingPrompt || !!routingTier },
  );

  const costByModel = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of costs ?? []) {
      map[c.model] = (map[c.model] ?? 0) + c.daily_cost;
    }
    return map;
  }, [costs]);

  const chartLabels = useMemo(() => Object.keys(costByModel), [costByModel]);
  const chartSeries = useMemo(() => [{
    label: 'Daily cost ($)',
    data: Object.values(costByModel),
    color: 'var(--mn-accent)',
  }], [costByModel]);

  if (loading) return <MnStateScaffold state="loading" message="Loading inference data..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inference</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Cost by Model" collapsible defaultOpen>
          <div className="p-4">
            {chartLabels.length > 0 ? (
              <MnChart type="bar" labels={chartLabels} series={chartSeries} showLegend={false} />
            ) : (
              <p className="text-sm text-muted-foreground">No cost data</p>
            )}
          </div>
        </MnSectionCard>

        <MnSectionCard title="Routing Decision" collapsible defaultOpen>
          <div className="space-y-3 p-4">
            <MnFormField label="Prompt">
              <input type="text" value={routingPrompt}
                onChange={(e) => setRoutingPrompt(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Describe the task..." />
            </MnFormField>
            <MnFormField label="Tier">
              <select value={routingTier}
                onChange={(e) => setRoutingTier(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">Any</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="economy">Economy</option>
              </select>
            </MnFormField>
            {routing && (
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm font-medium">Decision: {routing.decision}</p>
                {routing.model_metrics.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {routing.model_metrics.map((m) => (
                      <div key={m.model} className="flex items-center justify-between text-xs">
                        <span className="font-medium">{m.model}</span>
                        <div className="flex gap-3">
                          <span>{m.latency_ms}ms</span>
                          <span>${m.cost_per_1k_tokens}/1k</span>
                          <MnBadge tone={m.quality_score >= 0.8 ? 'success' : m.quality_score >= 0.5 ? 'warning' : 'danger'}>
                            Q: {(m.quality_score * 100).toFixed(0)}%
                          </MnBadge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </MnSectionCard>
      </div>

      <MnSectionCard title="Cost Breakdown" badge={(costs ?? []).length} collapsible defaultOpen>
        <MnDataTable
          columns={COST_COLS}
          data={(costs ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No cost data available"
        />
      </MnSectionCard>

      <MnSectionCard title="Budget Alerts" collapsible defaultOpen>
        <div className="p-4">
          <div className="space-y-2">
            {(costs ?? []).filter((c) => c.daily_cost > 50).map((c) => (
              <div key={c.entity_id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <span className="text-sm">{c.entity_id} ({c.model})</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${c.daily_cost.toFixed(2)}/day</span>
                  <MnBadge tone="warning">High spend</MnBadge>
                </div>
              </div>
            ))}
            {(costs ?? []).filter((c) => c.daily_cost > 50).length === 0 && (
              <p className="text-sm text-muted-foreground">No budget alerts</p>
            )}
          </div>
        </div>
      </MnSectionCard>
    </div>
  );
}
