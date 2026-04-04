'use client';

import { useCallback, useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { useSse } from '@/hooks/use-sse';
import * as api from '@/lib/api';
import type {
  IpcEvent,
  RuntimeView,
  CostSummary,
} from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import {
  MnSystemStatus,
  type Service,
} from '@/components/maranello/network';
import {
  MnActivityFeed,
  type ActivityItem,
} from '@/components/maranello/feedback';
import {
  MnActiveMissions,
  type Mission,
} from '@/components/maranello/agentic';
import {
  MnHubSpoke,
  type HubSpokeHub,
  type HubSpokeSpoke,
} from '@/components/maranello/agentic';
import { MnBadge } from '@/components/maranello/data-display';
import { MnChart } from '@/components/maranello/data-viz';

/* ── SSE event filter ── */

type EventFilter =
  | ''
  | 'MessageSent'
  | 'TaskAssigned'
  | 'TaskCompleted'
  | 'DelegationStarted';

const FILTERS: { label: string; value: EventFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Messages', value: 'MessageSent' },
  { label: 'Tasks', value: 'TaskAssigned' },
  { label: 'Completed', value: 'TaskCompleted' },
  { label: 'Delegations', value: 'DelegationStarted' },
];

/* ── Helpers ── */

function healthToService(c: {
  name: string;
  status: 'ok' | 'degraded' | 'down';
  latency_ms?: number;
}): Service {
  return {
    id: c.name,
    name: c.name,
    status:
      c.status === 'ok'
        ? 'operational'
        : c.status === 'degraded'
          ? 'degraded'
          : 'outage',
    latencyMs: c.latency_ms,
  };
}

function eventToActivity(e: IpcEvent): ActivityItem {
  return {
    agent: e.from,
    action: e.event_type,
    target: e.to ?? '',
    timestamp: e.ts,
    priority: e.event_type.includes('Alert')
      ? 'critical'
      : 'normal',
  };
}

/* ── Dashboard ── */

export default function DashboardPage() {
  const [filter, setFilter] = useState<EventFilter>('');
  const [events, setEvents] = useState<IpcEvent[]>([]);

  const onMessage = useCallback((event: IpcEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 200));
  }, []);

  const { connected } = useSse({
    event_type: filter || undefined,
    onMessage,
  });

  const { data: runtime } = useApiQuery<RuntimeView>(
    api.agentRuntime,
    { pollInterval: 10_000 },
  );
  const { data: deepHealth, refetch: refetchHealth } =
    useApiQuery(api.healthDeep, { pollInterval: 30_000 });
  const { data: costs } = useApiQuery(
    () => api.inferenceCosts({}),
    { pollInterval: 30_000 },
  );

  const services: Service[] = useMemo(
    () => (deepHealth?.components ?? []).map(healthToService),
    [deepHealth],
  );

  const activityItems: ActivityItem[] = useMemo(
    () => events.map(eventToActivity),
    [events],
  );

  const missions: Mission[] = useMemo(() => {
    if (!runtime) return [];
    const pct =
      runtime.total_budget_usd > 0
        ? Math.round(
            (runtime.total_spent_usd / runtime.total_budget_usd) *
              100,
          )
        : 0;
    return [
      {
        id: 'active',
        name: `${runtime.active_agents} active agent${runtime.active_agents !== 1 ? 's' : ''}`,
        progress: pct,
        status: 'active' as const,
        agent: `${runtime.delegations_active} delegations`,
      },
    ];
  }, [runtime]);

  const hubData: HubSpokeHub = {
    label: 'Convergio',
    status: 'online',
  };
  const spokeData: HubSpokeSpoke[] = useMemo(
    () =>
      services.slice(0, 8).map((s) => ({
        label: s.name,
        status:
          s.status === 'operational'
            ? ('online' as const)
            : s.status === 'degraded'
              ? ('degraded' as const)
              : ('offline' as const),
        connected: s.status !== 'outage',
      })),
    [services],
  );

  const costLabels = useMemo(
    () => (costs ?? []).map((c: CostSummary) => c.entity_id),
    [costs],
  );
  const costSeries = useMemo(
    () => [
      {
        label: 'Daily cost ($)',
        data: (costs ?? []).map(
          (c: CostSummary) => c.daily_cost,
        ),
        color: 'var(--mn-accent)',
      },
    ],
    [costs],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <MnBadge tone={connected ? 'success' : 'danger'}>
          {connected ? 'Live' : 'Disconnected'}
        </MnBadge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Active Agents"
          value={runtime?.active_agents ?? 0}
        />
        <KpiCard
          label="Queue Depth"
          value={runtime?.queue_depth ?? 0}
        />
        <KpiCard
          label="Budget Spent"
          value={`$${(runtime?.total_spent_usd ?? 0).toFixed(2)}`}
          sub={`of $${(runtime?.total_budget_usd ?? 0).toFixed(2)}`}
        />
        <KpiCard
          label="Stale Tasks"
          value={runtime?.stale_count ?? 0}
          warn={(runtime?.stale_count ?? 0) > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard
          title="Event Stream"
          collapsible
          defaultOpen
        >
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="max-h-80 overflow-y-auto">
            <MnActivityFeed
              items={activityItems}
              ariaLabel="Real-time event stream"
            />
          </div>
        </MnSectionCard>

        <MnSectionCard
          title="System Health"
          collapsible
          defaultOpen
        >
          <div className="p-4">
            <MnSystemStatus
              services={services}
              onRefresh={refetchHealth}
              refreshInterval={30_000}
            />
          </div>
        </MnSectionCard>

        <MnSectionCard
          title="Active Agents"
          collapsible
          defaultOpen
        >
          <div className="p-4">
            <MnActiveMissions missions={missions} />
          </div>
        </MnSectionCard>

        <MnSectionCard
          title="Delegation Graph"
          collapsible
          defaultOpen
        >
          <div className="flex items-center justify-center p-4">
            <MnHubSpoke hub={hubData} spokes={spokeData} />
          </div>
        </MnSectionCard>

        <MnSectionCard
          title="Cost by Entity"
          collapsible
          defaultOpen
        >
          <div className="p-4">
            {(costs ?? []).length > 0 ? (
              <MnChart
                type="bar"
                labels={costLabels}
                series={costSeries}
                showLegend={false}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No cost data available
              </p>
            )}
          </div>
        </MnSectionCard>

        <MnSectionCard
          title="Agent Messages"
          collapsible
          defaultOpen
        >
          <div className="max-h-64 overflow-y-auto p-4">
            {events
              .filter((e) => e.event_type === 'MessageSent')
              .slice(0, 50)
              .map((e, i) => (
                <div
                  key={`${e.ts}-${i}`}
                  className="flex gap-2 border-b border-border py-2 last:border-0"
                >
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {e.from}
                  </span>
                  {e.to && (
                    <span className="text-xs text-muted-foreground">
                      &rarr; {e.to}
                    </span>
                  )}
                  <span className="flex-1 text-xs text-foreground">
                    {e.content}
                  </span>
                  <span className="shrink-0 text-[0.65rem] text-muted-foreground tabular-nums">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            {events.filter(
              (e) => e.event_type === 'MessageSent',
            ).length === 0 && (
              <p className="text-sm text-muted-foreground">
                No messages yet
              </p>
            )}
          </div>
        </MnSectionCard>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  warn,
}: {
  label: string;
  value: string | number;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-2xl font-bold tabular-nums ${warn ? 'text-destructive' : ''}`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}
