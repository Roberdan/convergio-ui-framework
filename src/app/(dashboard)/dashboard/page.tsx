'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useApiQuery } from '@/hooks/use-api-query';
import { useSse } from '@/hooks/use-sse';
import * as api from '@/lib/api';
import type { Agent, IpcEvent, RuntimeView, CostSummary } from '@/lib/types';
import { DiscoveredAgentsList } from '../discovered-agents';
import { MnDashboardStrip, MnSectionCard } from '@/components/maranello/layout';
import { MnSystemStatus, type Service } from '@/components/maranello/network';
import { MnActivityFeed, type ActivityItem } from '@/components/maranello/feedback';
import {
  MnActiveMissions, type Mission, MnNeuralNodes, type NeuralNodesController,
  MnHubSpoke, type HubSpokeHub, MnAugmentedBrain, MnAugmentedBrainV2,
} from '@/components/maranello/agentic';

// `MnBrain3D` pulls in `three` (~800 KB gz) + `react-force-graph-3d` +
// `three-spritetext`. Load on demand so the dashboard First Load JS stays
// lean for visitors who never scroll to the 3D panel.
const MnBrain3D = dynamic(
  () =>
    import('@/components/maranello/agentic').then((m) => ({
      default: m.MnBrain3D,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="h-[500px] w-full rounded-lg border bg-muted/30"
      />
    ),
  },
);
import { MnBadge } from '@/components/maranello/data-display';
import { MnChart } from '@/components/maranello/data-viz';
import {
  activityItems as demoActivityItems,
  brain3DEdges as demoBrain3DEdgeSeed, brain3DNodes as demoBrain3DSeed,
  brainConnections as demoBrainConnectionsSeed, brainNodes as demoBrainNodesSeed,
  brainV2Nodes as demoBrainV2NodesSeed, brainV2Stats as demoBrainV2StatsSeed,
  brainV2Synapses as demoBrainV2SynapsesSeed,
  hubSpokeHub as demoHubSeed, hubSpokeSpokes as demoSpokeSeed,
  missions as demoMissionSeed,
} from '../showcase/showcase-data';
import {
  type EventFilter, FILTERS, DEMO_SUMMARY, DEMO_SERVICES, DEMO_COSTS,
  DEMO_MESSAGES, DEMO_STRIP_ZONES, healthToService, eventToActivity,
} from './dashboard-page.data';
import {
  buildNeuralGraph, buildHubSpokeData, buildBrainV1, buildBrainV2,
  buildBrain3D, buildDemoNeural,
} from './dashboard-page.brains';
import { KpiCard, AgentMessagesList } from './dashboard-page.widgets';

export default function DashboardPage() {
  const [filter, setFilter] = useState<EventFilter>('');
  const [events, setEvents] = useState<IpcEvent[]>([]);
  const neuralCtrl = useRef<NeuralNodesController | null>(null);

  const onMessage = useCallback((event: IpcEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 200));
    if (neuralCtrl.current) {
      neuralCtrl.current.pulse(event.from);
      if (event.to) neuralCtrl.current.highlightNode(event.to);
    }
  }, []);

  const { connected } = useSse({ event_type: filter || undefined, onMessage });

  const { data: runtime } = useApiQuery<RuntimeView>(api.agentRuntime, { pollInterval: 10_000 });
  const { data: deepHealth, refetch: refetchHealth } = useApiQuery(api.healthDeep, { pollInterval: 30_000 });
  const { data: costsRaw } = useApiQuery(() => api.inferenceCosts({}), { pollInterval: 30_000 });
  const costs: CostSummary[] = useMemo(() => {
    if (Array.isArray(costsRaw)) return costsRaw;
    const wrapped = costsRaw as unknown as Record<string, unknown> | null;
    if (wrapped && Array.isArray(wrapped.costs)) return wrapped.costs as CostSummary[];
    return [];
  }, [costsRaw]);
  const { data: agents } = useApiQuery<Agent[]>(api.agentList, { pollInterval: 30_000 });

  const services: Service[] = useMemo(() => (deepHealth?.components ?? []).map(healthToService), [deepHealth]);
  const activityItems: ActivityItem[] = useMemo(() => events.map(eventToActivity), [events]);
  const missions: Mission[] = useMemo(() => {
    if (!runtime) return [];
    const pct = runtime.total_budget_usd > 0
      ? Math.round((runtime.total_spent_usd / runtime.total_budget_usd) * 100) : 0;
    return [{
      id: 'active',
      name: `${runtime.active_agents.length} active agent${runtime.active_agents.length !== 1 ? 's' : ''}`,
      progress: pct, status: 'active' as const,
      agent: `${runtime.delegations_active} delegations`,
    }];
  }, [runtime]);

  const hasLiveData = Boolean(
    runtime && ((runtime.active_agents?.length ?? 0) > 0 || (runtime.discovered_agents?.length ?? 0) > 0
      || (runtime.queue_depth ?? 0) > 0 || (runtime.total_spent_usd ?? 0) > 0 || (runtime.stale_count ?? 0) > 0),
  ) || events.length > 0 || services.length > 0 || costs.length > 0;
  const demoMode = !hasLiveData;

  const summary = demoMode ? DEMO_SUMMARY : {
    activeAgents: (runtime?.active_agents?.length ?? 0) + (runtime?.discovered_agents?.length ?? 0),
    externalAgents: runtime?.discovered_agents?.length ?? 0,
    queueDepth: runtime?.queue_depth ?? 0,
    totalSpentUsd: runtime?.total_spent_usd ?? 0,
    totalBudgetUsd: runtime?.total_budget_usd ?? 0,
    staleCount: runtime?.stale_count ?? 0,
  };

  const stripMetrics = demoMode
    ? [
        { label: 'Active Agents', value: DEMO_SUMMARY.activeAgents, trend: 'up' as const },
        { label: 'Queue Depth', value: DEMO_SUMMARY.queueDepth, trend: 'flat' as const },
        { label: 'Daily Spend', value: `$${DEMO_SUMMARY.totalSpentUsd.toFixed(0)}`, trend: 'down' as const },
        { label: 'Stale Tasks', value: DEMO_SUMMARY.staleCount, trend: 'flat' as const },
      ]
    : [
        { label: 'Active Agents', value: summary.activeAgents, trend: 'up' as const },
        { label: 'Queue Depth', value: summary.queueDepth, trend: 'flat' as const },
        { label: 'Daily Spend', value: `$${summary.totalSpentUsd.toFixed(0)}`, trend: 'down' as const },
        { label: 'Stale Tasks', value: summary.staleCount, trend: summary.staleCount > 0 ? ('up' as const) : ('flat' as const) },
      ];

  const effectiveServices = demoMode ? DEMO_SERVICES : services;
  const effectiveActivityItems = demoMode ? demoActivityItems : activityItems;
  const effectiveMissions = demoMode ? demoMissionSeed : missions;
  const effectiveCosts = demoMode ? DEMO_COSTS : costs;

  const { neuralNodes, neuralConns } = useMemo(() => buildNeuralGraph(agents, events), [agents, events]);
  const hubData: HubSpokeHub = { label: 'Convergio', status: 'online' };
  const spokeData = useMemo(() => buildHubSpokeData(services), [services]);
  const costLabels = useMemo(() => effectiveCosts.map((c: CostSummary) => c.entity_id), [effectiveCosts]);
  const costSeries = useMemo(() => [{
    label: 'Daily cost ($)', data: effectiveCosts.map((c: CostSummary) => c.daily_cost), color: 'var(--mn-accent)',
  }], [effectiveCosts]);

  const { brainNodes, brainConns } = useMemo(() => buildBrainV1(runtime), [runtime]);
  const { brainV2Nodes, brainV2Synapses, brainV2Stats } = useMemo(() => buildBrainV2(runtime), [runtime]);
  const { brain3DNodes, brain3DEdges } = useMemo(() => buildBrain3D(runtime), [runtime]);
  const demoNeural = useMemo(() => buildDemoNeural(demoBrain3DSeed, demoBrain3DEdgeSeed), []);

  const effNeural = demoMode ? demoNeural.nodes : neuralNodes;
  const effNeuralConns = demoMode ? demoNeural.conns : neuralConns;
  const effBrainNodes = demoMode ? demoBrainNodesSeed : brainNodes;
  const effBrainConns = demoMode ? demoBrainConnectionsSeed : brainConns;
  const effBrainV2Nodes = demoMode ? demoBrainV2NodesSeed : brainV2Nodes;
  const effBrainV2Synapses = demoMode ? demoBrainV2SynapsesSeed : brainV2Synapses;
  const effBrainV2Stats = demoMode ? demoBrainV2StatsSeed : brainV2Stats;
  const effBrain3DNodes = demoMode ? demoBrain3DSeed : brain3DNodes;
  const effBrain3DEdges = demoMode ? demoBrain3DEdgeSeed : brain3DEdges;
  const messageEvents = demoMode ? DEMO_MESSAGES : events.filter((e) => e.event_type === 'MessageSent');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{demoMode ? 'Convergio Frontend Framework' : 'Dashboard'}</h1>
          <p className="text-sm text-muted-foreground">
            {demoMode
              ? 'Demo mode keeps the homepage rich with animated dashboards, charts, and seeded framework data even when no daemon is attached.'
              : 'Live runtime telemetry from the active agent mesh.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {demoMode ? (
            <Link href="/showcase" className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Explore components</Link>
          ) : null}
          <MnBadge tone={demoMode ? 'info' : connected ? 'success' : 'danger'}>
            {demoMode ? 'Demo mode' : connected ? 'Live' : 'Disconnected'}
          </MnBadge>
        </div>
      </div>

      <MnDashboardStrip metrics={stripMetrics} zones={demoMode ? DEMO_STRIP_ZONES : undefined} ariaLabel="Framework dashboard preview" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Active Agents" value={summary.activeAgents} sub={summary.externalAgents ? `${summary.externalAgents} external` : undefined} />
        <KpiCard label="Queue Depth" value={summary.queueDepth} />
        <KpiCard label="Budget Spent" value={`$${summary.totalSpentUsd.toFixed(2)}`} sub={`of $${summary.totalBudgetUsd.toFixed(2)}`} />
        <KpiCard label="Stale Tasks" value={summary.staleCount} warn={summary.staleCount > 0} />
      </div>

      <MnSectionCard title="Brain 3D" collapsible={false}>
        <div className="p-4" style={{ minHeight: 500 }}>
          {effBrain3DNodes.length === 0
            ? <p className="text-sm text-muted-foreground">No active workers</p>
            : <MnBrain3D nodes={effBrain3DNodes} edges={effBrain3DEdges} autoRotate autoRotateSpeed={0.4} showLabels height={500} size="fluid" />}
        </div>
      </MnSectionCard>

      <MnSectionCard title={`Active Agents (${effNeural.length})`} collapsible defaultOpen>
        <div className="p-4" style={{ height: effNeural.length > 0 ? 420 : 80 }}>
          {effNeural.length === 0
            ? <p className="text-sm text-muted-foreground">No agents working right now</p>
            : <MnNeuralNodes nodes={effNeural} connections={effNeuralConns} interactive labels forceLayout pulseSpeed={0.8} particleCount={2} size="fluid" onReady={(ctrl) => { neuralCtrl.current = ctrl; }} />}
        </div>
      </MnSectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Augmented Brain" collapsible={false}>
          <div className="p-4" style={{ minHeight: 420 }}>
            {effBrainNodes.length === 0
              ? <p className="text-sm text-muted-foreground">No active workers</p>
              : <MnAugmentedBrain nodes={effBrainNodes} connections={effBrainConns} height={420} size="fluid" />}
          </div>
        </MnSectionCard>
        <MnSectionCard title="Brain V2 — Synaptic Map" collapsible={false}>
          <div className="p-4" style={{ minHeight: 420 }}>
            {effBrainV2Nodes.length === 0
              ? <p className="text-sm text-muted-foreground">No active workers</p>
              : <MnAugmentedBrainV2 nodes={effBrainV2Nodes} synapses={effBrainV2Synapses} stats={effBrainV2Stats} title="Worker Synapses" showControls height={420} size="fluid" />}
          </div>
        </MnSectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Event Stream" collapsible defaultOpen>
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="max-h-80 overflow-y-auto">
            <MnActivityFeed items={effectiveActivityItems} ariaLabel="Real-time event stream" />
          </div>
        </MnSectionCard>
        <MnSectionCard title="System Health" collapsible defaultOpen>
          <div className="p-4"><MnSystemStatus services={effectiveServices} onRefresh={refetchHealth} refreshInterval={30_000} /></div>
        </MnSectionCard>
        <MnSectionCard title="Active Agents" collapsible defaultOpen>
          <div className="p-4">
            <MnActiveMissions missions={effectiveMissions} />
            {!demoMode ? <DiscoveredAgentsList agents={runtime?.discovered_agents ?? []} /> : null}
          </div>
        </MnSectionCard>
        <MnSectionCard title="Service Topology" collapsible defaultOpen>
          <div className="flex items-center justify-center p-4">
            <MnHubSpoke hub={demoMode ? demoHubSeed : hubData} spokes={demoMode ? demoSpokeSeed : spokeData} />
          </div>
        </MnSectionCard>
        <MnSectionCard title="Cost by Entity" collapsible defaultOpen>
          <div className="p-4">
            {effectiveCosts.length > 0
              ? <MnChart type="bar" labels={costLabels} series={costSeries} showLegend={false} />
              : <p className="text-sm text-muted-foreground">No cost data available</p>}
          </div>
        </MnSectionCard>
        <MnSectionCard title="Agent Messages" collapsible defaultOpen>
          <AgentMessagesList events={messageEvents} />
        </MnSectionCard>
      </div>
    </div>
  );
}
