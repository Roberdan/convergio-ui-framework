'use client';

import { useCallback, useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { useSse } from '@/hooks/use-sse';
import * as api from '@/lib/api';
import type { IpcEvent, TimelineEvent, Anomaly, ObservatoryDashboard } from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnBadge } from '@/components/maranello/data-display';
import { MnChart } from '@/components/maranello/data-viz';
import { MnActivityFeed, type ActivityItem } from '@/components/maranello/feedback';
import { MnStateScaffold } from '@/components/maranello/feedback';

export default function ObservatoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sseEvents, setSseEvents] = useState<IpcEvent[]>([]);

  const onSseMessage = useCallback((e: IpcEvent) => {
    setSseEvents((prev) => [e, ...prev].slice(0, 200));
  }, []);

  const { connected } = useSse({
    event_type: typeFilter || undefined,
    org_id: orgFilter || undefined,
    onMessage: onSseMessage,
  });

  const { data: dashboard, loading, error, refetch } =
    useApiQuery<ObservatoryDashboard>(() => api.observatoryDashboard(), { pollInterval: 30_000 });
  const { data: timeline } = useApiQuery<TimelineEvent[]>(
    () => api.observatoryTimeline({
      org_id: orgFilter || undefined,
      event_type: typeFilter || undefined,
      source: sourceFilter || undefined,
      limit: 100,
    }),
    { pollInterval: 15_000 },
  );
  const { data: anomalies, refetch: refetchAnomalies } = useApiQuery<Anomaly[]>(
    () => api.observatoryAnomalies({ include_resolved: false, limit: 50 }),
    { pollInterval: 30_000 },
  );
  const { data: searchResults } = useApiQuery(
    () => searchQuery.length >= 2 ? api.observatorySearch(searchQuery, 20) : Promise.resolve([]),
    { enabled: searchQuery.length >= 2 },
  );

  const activityItems: ActivityItem[] = useMemo(() => {
    const polled = (timeline ?? []).map((e) => ({
      agent: e.source ?? 'system',
      action: e.event_type,
      target: e.org_id ?? '',
      timestamp: e.timestamp,
      priority: e.event_type.includes('Alert') ? 'critical' as const : 'normal' as const,
    }));
    const live = sseEvents.map((e) => ({
      agent: e.from,
      action: e.event_type,
      target: e.to ?? '',
      timestamp: e.ts,
      priority: e.event_type.includes('Alert') ? 'critical' as const : 'normal' as const,
    }));
    return [...live, ...polled].slice(0, 200);
  }, [timeline, sseEvents]);

  const modelLabels = useMemo(
    () => Object.keys(dashboard?.model_breakdown ?? {}),
    [dashboard],
  );
  const modelSegments = useMemo(
    () => Object.entries(dashboard?.model_breakdown ?? {}).map(([label, value]) => ({
      label, value: value as number,
    })),
    [dashboard],
  );

  const handleResolve = useCallback(async (anomaly: Anomaly) => {
    await api.observatoryResolve(anomaly.id);
    refetchAnomalies();
  }, [refetchAnomalies]);

  if (loading) return <MnStateScaffold state="loading" message="Loading observatory..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Observatory</h1>
        <div className="flex items-center gap-2">
          <MnBadge tone={connected ? 'success' : 'danger'}>
            {connected ? 'Live' : 'Polling'}
          </MnBadge>
          {(anomalies ?? []).length > 0 && (
            <MnBadge tone="warning">{(anomalies ?? []).length} anomalies</MnBadge>
          )}
        </div>
      </div>

      {/* KPI dashboard */}
      {dashboard && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Cost/Hour" value={`$${dashboard.cost_per_hour.toFixed(2)}`} />
          <KpiCard label="Tasks/Day" value={dashboard.tasks_per_day} />
          <KpiCard label="Avg Latency" value={`${dashboard.avg_latency_ms.toFixed(0)}ms`} />
          <KpiCard label="Models" value={modelLabels.length} />
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search events, messages, audit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Filter by org..."
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="w-40 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Filter by source..."
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-40 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="MessageSent">Messages</option>
          <option value="TaskAssigned">Tasks</option>
          <option value="DelegationStarted">Delegations</option>
          <option value="BudgetAlert">Budget alerts</option>
          <option value="HealthDegraded">Health</option>
        </select>
      </div>

      {/* Search results */}
      {searchResults && searchResults.length > 0 && (
        <MnSectionCard title={`Search Results (${searchResults.length})`} collapsible defaultOpen>
          <div className="space-y-2 p-4">
            {searchResults.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
                <MnBadge tone="info">{r.kind}</MnBadge>
                <span className="flex-1 text-sm">{r.excerpt}</span>
                <span className="text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{r.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </MnSectionCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <MnSectionCard title="Event Timeline" badge={(timeline ?? []).length} collapsible defaultOpen>
          <div className="max-h-96 overflow-y-auto">
            <MnActivityFeed items={activityItems} ariaLabel="Observatory timeline" />
          </div>
        </MnSectionCard>

        {/* Model breakdown */}
        <MnSectionCard title="Model Breakdown" collapsible defaultOpen>
          <div className="p-4">
            {modelSegments.length > 0 ? (
              <MnChart type="donut" segments={modelSegments} showLegend />
            ) : (
              <p className="text-sm text-muted-foreground">No model data</p>
            )}
          </div>
        </MnSectionCard>
      </div>

      {/* Anomalies */}
      <MnSectionCard title="Anomaly Detection" badge={(anomalies ?? []).length} collapsible defaultOpen>
        {(anomalies ?? []).length > 0 ? (
          <div className="space-y-2 p-4">
            {(anomalies ?? []).map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-md border p-3">
                <MnBadge tone={a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}>
                  {a.severity}
                </MnBadge>
                <span className="flex-1 text-sm">{a.message}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.detected_at).toLocaleString()}
                </span>
                {!a.resolved && (
                  <button
                    onClick={() => handleResolve(a)}
                    className="rounded-md border px-3 py-1 text-xs hover:bg-muted/50"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">No active anomalies</p>
          </div>
        )}
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
