'use client';

import { useEffect, useMemo, useReducer } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as api from '@/lib/api';
import type { Metric, MetricsResponse } from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnChart, type ChartSeries } from '@/components/maranello/data-viz';
import { MnStateScaffold } from '@/components/maranello/feedback';
import { MnBadge } from '@/components/maranello/data-display';

const MAX_POINTS = 60;

interface TimePoint { ts: number; value: number }
type MetricHistory = Record<string, TimePoint[]>

const COLORS = [
  'var(--mn-accent)', 'var(--mn-success)', 'var(--mn-warning)',
  'var(--mn-info)', 'var(--mn-error)',
];

interface AppendAction { metrics: Metric[]; ts: number }

function historyReducer(state: MetricHistory, action: AppendAction): MetricHistory {
  const next: MetricHistory = { ...state };
  for (const m of action.metrics) {
    const pts = state[m.name] ?? [];
    next[m.name] = [...pts, { ts: action.ts, value: m.value }].slice(-MAX_POINTS);
  }
  return next;
}

function inGroup(name: string, kw: string[]): boolean {
  return kw.some((k) => name.toLowerCase().includes(k));
}

export default function MetricsPage() {
  const [history, dispatch] = useReducer(historyReducer, {});

  const { data, loading, error, refetch } = useApiQuery<MetricsResponse>(
    api.metrics,
    { pollInterval: 10_000 },
  );

  useEffect(() => {
    if (!data?.metrics) return;
    dispatch({ metrics: data.metrics, ts: Date.now() });
  }, [data]);

  const allNames = useMemo(() => Object.keys(history), [history]);

  const groups = useMemo(() => {
    const cpu = allNames.filter((n) => inGroup(n, ['cpu']));
    const mem = allNames.filter((n) => inGroup(n, ['mem', 'memory']));
    const req = allNames.filter((n) => inGroup(n, ['request', 'req', 'http']));
    const agent = allNames.filter((n) => inGroup(n, ['agent']));
    const seen = new Set([...cpu, ...mem, ...req, ...agent]);
    const other = allNames.filter((n) => !seen.has(n));
    return { cpu, mem, req, agent, other };
  }, [allNames]);

  if (loading && allNames.length === 0)
    return <MnStateScaffold state="loading" message="Loading metrics..." />;
  if (error && allNames.length === 0)
    return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Metrics</h1>
        <MnBadge tone={data ? 'success' : 'warning'}>
          {data ? 'Live · 10s' : 'Stale'}
        </MnBadge>
      </div>

      {(data?.metrics ?? []).length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(data?.metrics ?? []).slice(0, 8).map((m) => (
            <div key={m.name} className="rounded-lg border bg-card p-4">
              <p className="truncate text-xs text-muted-foreground">{m.name}</p>
              <p className="text-2xl font-bold tabular-nums">
                {m.value % 1 === 0 ? m.value : m.value.toFixed(2)}
                {m.unit && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">{m.unit}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.cpu.length > 0 && (
          <MetricChart title="CPU" names={groups.cpu} history={history} />
        )}
        {groups.mem.length > 0 && (
          <MetricChart title="Memory" names={groups.mem} history={history} />
        )}
        {groups.req.length > 0 && (
          <MetricChart title="Requests" names={groups.req} history={history} />
        )}
        {groups.agent.length > 0 && (
          <MetricChart title="Agents" names={groups.agent} history={history} />
        )}
        {groups.other.length > 0 && (
          <MetricChart title="System" names={groups.other} history={history} />
        )}
      </div>

      {allNames.length === 0 && !loading && (
        <MnStateScaffold state="empty" message="No metrics available from daemon" />
      )}
    </div>
  );
}

function MetricChart({ title, names, history }: {
  title: string;
  names: string[];
  history: MetricHistory;
}) {
  const allTs = useMemo(() => {
    const s = new Set<number>();
    for (const n of names) for (const p of (history[n] ?? [])) s.add(p.ts);
    return [...s].sort();
  }, [names, history]);

  const labels = useMemo(
    () => allTs.map((ts) => new Date(ts).toLocaleTimeString()),
    [allTs],
  );

  const series: ChartSeries[] = useMemo(
    () => names.map((name, i) => {
      const pm = Object.fromEntries((history[name] ?? []).map((p) => [p.ts, p.value]));
      return {
        label: name,
        data: allTs.map((ts) => pm[ts] ?? 0),
        color: COLORS[i % COLORS.length],
      };
    }),
    [names, history, allTs],
  );

  if (labels.length === 0) return null;

  return (
    <MnSectionCard title={title} collapsible defaultOpen>
      <div className="p-4">
        <MnChart type="area" labels={labels} series={series} showLegend={names.length > 1} />
      </div>
    </MnSectionCard>
  );
}
