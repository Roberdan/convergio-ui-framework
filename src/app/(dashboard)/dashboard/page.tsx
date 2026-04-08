'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useApiQuery } from '@/hooks/use-api-query';
import { useSse } from '@/hooks/use-sse';
import * as api from '@/lib/api';
import type {
  Agent,
  IpcEvent,
  RuntimeView,
  RuntimeWorker,
  CostSummary,
} from '@/lib/types';
import { DiscoveredAgentsList } from '../discovered-agents';
import { discoveredToBrainV1, discoveredToBrainV2, discoveredToBrain3D } from '../brain-helpers';
import { MnDashboardStrip, MnSectionCard } from '@/components/maranello/layout';
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
  MnNeuralNodes,
  type NeuralNodesController,
  type NeuralNodeData,
  type NeuralConnection,
  MnHubSpoke,
  type HubSpokeHub,
  type HubSpokeSpoke,
  MnAugmentedBrain,
  type BrainNode,
  type BrainConnection,
  MnAugmentedBrainV2,
  type BrainV2Node,
  type BrainV2Synapse,
  type BrainV2Stats,
  MnBrain3D,
  type Brain3DNode,
  type Brain3DEdge,
} from '@/components/maranello/agentic';
import { MnBadge } from '@/components/maranello/data-display';
import { MnChart } from '@/components/maranello/data-viz';
import {
  activityItems as demoActivityItems,
  brain3DEdges as demoBrain3DEdgeSeed,
  brain3DNodes as demoBrain3DSeed,
  brainConnections as demoBrainConnectionsSeed,
  brainNodes as demoBrainNodesSeed,
  brainV2Nodes as demoBrainV2NodesSeed,
  brainV2Stats as demoBrainV2StatsSeed,
  brainV2Synapses as demoBrainV2SynapsesSeed,
  hubSpokeHub as demoHubSeed,
  hubSpokeSpokes as demoSpokeSeed,
  missions as demoMissionSeed,
} from '../showcase/showcase-data';

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

const CAT_COLORS: Record<string, string> = {
  core_utility: '#6366f1',
  technical_development: '#22c55e',
  business_operations: '#f59e0b',
  leadership_strategy: '#ec4899',
  compliance_legal: '#8b5cf6',
  specialized_experts: '#14b8a6',
  design_ux: '#f97316',
  release_management: '#06b6d4',
  research_report: '#a855f7',
};

const DEMO_SUMMARY = {
  activeAgents: 28,
  externalAgents: 8,
  queueDepth: 41,
  totalSpentUsd: 2847.32,
  totalBudgetUsd: 6500,
  staleCount: 4,
};

const DEMO_SERVICES: Service[] = [
  { id: 'api', name: 'Control API', status: 'operational', uptime: 99.98, latencyMs: 82 },
  { id: 'mesh', name: 'Agent mesh', status: 'operational', uptime: 99.94, latencyMs: 109 },
  { id: 'night', name: 'Night runs', status: 'degraded', uptime: 98.7, latencyMs: 241 },
];

const DEMO_COSTS: CostSummary[] = [
  { entity_id: 'coordinator-opus', entity_type: 'agent', daily_cost: 128, monthly_cost: 2840, model: 'claude-opus' },
  { entity_id: 'worker-sonnet-03', entity_type: 'agent', daily_cost: 94, monthly_cost: 1980, model: 'claude-sonnet' },
  { entity_id: 'thor-validator', entity_type: 'agent', daily_cost: 58, monthly_cost: 1120, model: 'claude-haiku' },
  { entity_id: 'kernel-qwen', entity_type: 'node', daily_cost: 37, monthly_cost: 840, model: 'qwen2.5-coder' },
];

const DEMO_MESSAGES: IpcEvent[] = [
  {
    from: 'coordinator-opus',
    to: 'worker-sonnet-03',
    content: 'Prepare the release narrative and verify the keyboard states before handoff.',
    event_type: 'MessageSent',
    ts: '2026-04-08T14:11:00.000Z',
  },
  {
    from: 'thor-validator',
    to: 'coordinator-opus',
    content: 'Accessibility gate passed after contrast correction on the summary cards.',
    event_type: 'MessageSent',
    ts: '2026-04-08T13:58:00.000Z',
  },
  {
    from: 'kernel-jarvis',
    content: 'Queued the executive preset rebuild with seeded charts and decision tables.',
    event_type: 'MessageSent',
    ts: '2026-04-08T13:42:00.000Z',
  },
];

const DEMO_STRIP_ZONES = [
  {
    type: 'trend' as const,
    title: 'Signal',
    items: [
      { label: 'Adoption', value: '84%', data: [61, 66, 70, 76, 81, 84] },
      { label: 'Latency', value: '182ms', data: [240, 228, 216, 203, 191, 182] },
    ],
  },
  {
    type: 'pipeline' as const,
    title: 'Flow',
    rows: [
      { label: 'Queued', value: 27, secondary: 'now' },
      { label: 'Review', value: 11, secondary: 'gated' },
      { label: 'Ship', value: 6, secondary: 'today' },
    ],
    footer: { label: 'Success', value: '98.4%' },
  },
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
  const neuralCtrl = useRef<NeuralNodesController | null>(null);

  const onMessage = useCallback((event: IpcEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 200));
    if (neuralCtrl.current) {
      neuralCtrl.current.pulse(event.from);
      if (event.to) neuralCtrl.current.highlightNode(event.to);
    }
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
  const { data: costsRaw } = useApiQuery(
    () => api.inferenceCosts({}),
    { pollInterval: 30_000 },
  );
  const costs: CostSummary[] = useMemo(() => {
    if (Array.isArray(costsRaw)) return costsRaw;
    const wrapped = costsRaw as unknown as Record<string, unknown> | null;
    if (wrapped && Array.isArray(wrapped.costs)) return wrapped.costs as CostSummary[];
    return [];
  }, [costsRaw]);

  const { data: agents } = useApiQuery<Agent[]>(
    api.agentList,
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
            (runtime.total_spent_usd / runtime.total_budget_usd) * 100,
          )
        : 0;
    return [
      {
        id: 'active',
        name: `${runtime.active_agents.length} active agent${runtime.active_agents.length !== 1 ? 's' : ''}`,
        progress: pct,
        status: 'active' as const,
        agent: `${runtime.delegations_active} delegations`,
      },
    ];
  }, [runtime]);

  const hasLiveData = Boolean(
    runtime &&
    (
      (runtime.active_agents?.length ?? 0) > 0 ||
      (runtime.discovered_agents?.length ?? 0) > 0 ||
      (runtime.queue_depth ?? 0) > 0 ||
      (runtime.total_spent_usd ?? 0) > 0 ||
      (runtime.stale_count ?? 0) > 0
    ),
  ) || events.length > 0 || services.length > 0 || costs.length > 0;

  const demoMode = !hasLiveData;

  const summary = demoMode
    ? DEMO_SUMMARY
    : {
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

  /* ── Neural nodes: only agents active in the current SSE stream ── */
  const { neuralNodes, neuralConns } = useMemo(() => {
    const catalog = new Map((agents ?? []).map((a) => [a.name, a]));
    const activeNames = new Set(
      events.flatMap((e) => [e.from, e.to].filter(Boolean) as string[]),
    );
    if (activeNames.size === 0) {
      return { neuralNodes: [] as NeuralNodeData[], neuralConns: [] as NeuralConnection[] };
    }
    const nodes: NeuralNodeData[] = [...activeNames].map((name) => {
      const a = catalog.get(name);
      return {
        id: name,
        label: name,
        sublabel: a?.category ?? 'unknown',
        color: CAT_COLORS[a?.category ?? ''] ?? '#6366f1',
        group: a?.category ?? 'other',
        energy: 1.0,
        size: a?.tier === 't1' ? 1.5 : a?.tier === 't2' ? 1.2 : 1,
      };
    });
    const conns: NeuralConnection[] = [];
    for (const e of events) {
      if (e.to && activeNames.has(e.from) && activeNames.has(e.to)) {
        if (!conns.some((c) => c.from === e.from && c.to === e.to)) {
          conns.push({ from: e.from, to: e.to, strength: 0.6 });
        }
      }
    }
    return { neuralNodes: nodes, neuralConns: conns };
  }, [agents, events]);

  /* ── Hub/spoke for services ── */
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
    () => effectiveCosts.map((c: CostSummary) => c.entity_id),
    [effectiveCosts],
  );
  const costSeries = useMemo(
    () => [
      {
        label: 'Daily cost ($)',
        data: effectiveCosts.map((c: CostSummary) => c.daily_cost),
        color: 'var(--mn-accent)',
      },
    ],
    [effectiveCosts],
  );

  /* ── Brain V1: augmented brain from active + discovered workers ── */
  const { brainNodes, brainConns } = useMemo(() => {
    const workers = runtime?.active_agents ?? [];
    const discovered = runtime?.discovered_agents ?? [];
    if (workers.length === 0 && discovered.length === 0) {
      return { brainNodes: [] as BrainNode[], brainConns: [] as BrainConnection[] };
    }
    const layers: BrainNode['type'][] = ['core', 'memory', 'skill', 'sense'];
    const nodes: BrainNode[] = workers.map((w: RuntimeWorker, i: number) => ({
      id: w.id,
      label: w.agent_name,
      type: w.task_id ? 'core' : layers[i % layers.length],
      active: w.stage === 'running',
    }));
    const conns: BrainConnection[] = [];
    const coreIds = nodes.filter((n) => n.type === 'core').map((n) => n.id);
    for (const node of nodes) {
      if (node.type !== 'core' && coreIds.length > 0) {
        conns.push({ from: coreIds[0], to: node.id, strength: 0.6 });
      }
    }
    for (let i = 1; i < coreIds.length; i++) {
      conns.push({ from: coreIds[0], to: coreIds[i], strength: 0.8 });
    }
    const ext = discoveredToBrainV1(discovered, coreIds[0]);
    nodes.push(...ext.nodes);
    conns.push(...ext.conns);
    return { brainNodes: nodes, brainConns: conns };
  }, [runtime]);

  /* ── Brain V2: augmented brain v2 from active + discovered workers ── */
  const { brainV2Nodes, brainV2Synapses, brainV2Stats } = useMemo(() => {
    const workers = runtime?.active_agents ?? [];
    const discovered = runtime?.discovered_agents ?? [];
    if (workers.length === 0 && discovered.length === 0) {
      return {
        brainV2Nodes: [] as BrainV2Node[],
        brainV2Synapses: [] as BrainV2Synapse[],
        brainV2Stats: { sessions: 0, plans: 0, tasks: 0, synapses: 0 } as BrainV2Stats,
      };
    }
    const statusMap: Record<string, BrainV2Node['status']> = {
      running: 'active', spawning: 'idle', stopped: 'completed', error: 'error',
    };
    const hub: BrainV2Node = { id: 'hub-convergio', label: 'Convergio', type: 'hub', status: 'active', size: 2 };
    const nodes: BrainV2Node[] = [
      hub,
      ...workers.map((w: RuntimeWorker) => ({
        id: w.id,
        label: w.agent_name,
        type: (w.task_id ? 'task' : 'agent') as BrainV2Node['type'],
        status: statusMap[w.stage] ?? 'idle',
        size: w.budget_usd > 10 ? 1.5 : 1,
      })),
    ];
    const synapses: BrainV2Synapse[] = workers.map((w: RuntimeWorker) => ({
      from: hub.id,
      to: w.id,
      strength: w.stage === 'running' ? 0.8 : 0.3,
      active: w.stage === 'running',
    }));
    const ext = discoveredToBrainV2(discovered, hub.id);
    nodes.push(...ext.nodes);
    synapses.push(...ext.synapses);
    const tasked = workers.filter((w: RuntimeWorker) => w.task_id);
    return {
      brainV2Nodes: nodes,
      brainV2Synapses: synapses,
      brainV2Stats: {
        sessions: workers.length + discovered.length,
        tasks: tasked.length,
        synapses: synapses.length,
      } as BrainV2Stats,
    };
  }, [runtime]);

  /* ── Brain 3D: three.js brain from active + discovered workers ── */
  const { brain3DNodes, brain3DEdges } = useMemo(() => {
    const workers = runtime?.active_agents ?? [];
    const discovered = runtime?.discovered_agents ?? [];
    if (workers.length === 0 && discovered.length === 0) {
      return { brain3DNodes: [] as Brain3DNode[], brain3DEdges: [] as Brain3DEdge[] };
    }
    const statusMap: Record<string, Brain3DNode['status']> = {
      running: 'active', spawning: 'idle', stopped: 'offline', error: 'error',
    };
    const coordinator: Brain3DNode = {
      id: 'coord-main', label: 'Convergio', type: 'coordinator',
      status: 'active', activeTasks: workers.length + discovered.length, group: 'core',
    };
    const nodes: Brain3DNode[] = [
      coordinator,
      ...workers.map((w: RuntimeWorker) => ({
        id: w.id,
        label: w.agent_name,
        type: 'worker' as const,
        status: statusMap[w.stage] ?? ('idle' as const),
        model: w.model ?? undefined,
        activeTasks: w.task_id ? 1 : 0,
        group: w.org_id,
      })),
    ];
    const edges: Brain3DEdge[] = workers.map((w: RuntimeWorker) => ({
      source: coordinator.id,
      target: w.id,
      type: (w.task_id ? 'delegation' : 'sync') as Brain3DEdge['type'],
      strength: w.stage === 'running' ? 0.8 : 0.3,
      active: w.stage === 'running',
    }));
    const ext = discoveredToBrain3D(discovered, coordinator.id);
    nodes.push(...ext.nodes);
    edges.push(...ext.edges);
    return { brain3DNodes: nodes, brain3DEdges: edges };
  }, [runtime]);

  const demoNeural = useMemo(() => ({
    nodes: demoBrain3DSeed.slice(0, 16).map((node) => ({
      id: node.id,
      label: node.label,
      sublabel: node.model ?? node.type,
      color:
        node.type === 'coordinator'
          ? 'var(--mn-accent)'
          : node.status === 'error'
            ? 'var(--mn-danger)'
            : node.type === 'extension'
              ? 'var(--mn-warning)'
              : 'var(--mn-success)',
      group: node.type,
      energy: node.status === 'active' ? 1 : 0.55,
      size: node.type === 'coordinator' || node.type === 'core' ? 1.4 : 1,
    })),
    conns: demoBrain3DEdgeSeed.slice(0, 24).map((edge) => ({
      from: edge.source,
      to: edge.target,
      strength: edge.strength ?? 0.6,
    })),
  }), []);

  const effectiveNeuralNodes = demoMode ? demoNeural.nodes : neuralNodes;
  const effectiveNeuralConns = demoMode ? demoNeural.conns : neuralConns;
  const effectiveBrainNodes = demoMode ? demoBrainNodesSeed : brainNodes;
  const effectiveBrainConns = demoMode ? demoBrainConnectionsSeed : brainConns;
  const effectiveBrainV2Nodes = demoMode ? demoBrainV2NodesSeed : brainV2Nodes;
  const effectiveBrainV2Synapses = demoMode ? demoBrainV2SynapsesSeed : brainV2Synapses;
  const effectiveBrainV2Stats = demoMode ? demoBrainV2StatsSeed : brainV2Stats;
  const effectiveBrain3DNodes = demoMode ? demoBrain3DSeed : brain3DNodes;
  const effectiveBrain3DEdges = demoMode ? demoBrain3DEdgeSeed : brain3DEdges;
  const messageEvents = demoMode ? DEMO_MESSAGES : events.filter((e) => e.event_type === 'MessageSent');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {demoMode ? 'Convergio Frontend Framework' : 'Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {demoMode
              ? 'Demo mode keeps the homepage rich with animated dashboards, charts, and seeded framework data even when no daemon is attached.'
              : 'Live runtime telemetry from the active agent mesh.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {demoMode ? (
            <Link href="/showcase" className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
              Explore components
            </Link>
          ) : null}
          <MnBadge tone={demoMode ? 'info' : connected ? 'success' : 'danger'}>
            {demoMode ? 'Demo mode' : connected ? 'Live' : 'Disconnected'}
          </MnBadge>
        </div>
      </div>

      <MnDashboardStrip
        metrics={stripMetrics}
        zones={demoMode ? DEMO_STRIP_ZONES : undefined}
        ariaLabel="Framework dashboard preview"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Active Agents"
          value={summary.activeAgents}
          sub={summary.externalAgents ? `${summary.externalAgents} external` : undefined}
        />
        <KpiCard label="Queue Depth" value={summary.queueDepth} />
        <KpiCard
          label="Budget Spent"
          value={`$${summary.totalSpentUsd.toFixed(2)}`}
          sub={`of $${summary.totalBudgetUsd.toFixed(2)}`}
        />
        <KpiCard
          label="Stale Tasks"
          value={summary.staleCount}
          warn={summary.staleCount > 0}
        />
      </div>

      {/* Brain visualizations — NOT collapsible (animated overflow-hidden
           causes canvas clientWidth=0 during height transition) */}
      <MnSectionCard title="Brain 3D" collapsible={false}>
        <div className="p-4" style={{ minHeight: 500 }}>
          {effectiveBrain3DNodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active workers</p>
          ) : (
            <MnBrain3D
              nodes={effectiveBrain3DNodes}
              edges={effectiveBrain3DEdges}
              autoRotate
              autoRotateSpeed={0.4}
              showLabels
              height={500}
              size="fluid"
            />
          )}
        </div>
      </MnSectionCard>

      {/* Neural network — full width */}
      <MnSectionCard title={`Active Agents (${effectiveNeuralNodes.length})`} collapsible defaultOpen>
        <div className="p-4" style={{ height: effectiveNeuralNodes.length > 0 ? 420 : 80 }}>
          {effectiveNeuralNodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agents working right now</p>
          ) : (
            <MnNeuralNodes
              nodes={effectiveNeuralNodes}
              connections={effectiveNeuralConns}
              interactive
              labels
              forceLayout
              pulseSpeed={0.8}
              particleCount={2}
              size="fluid"
              onReady={(ctrl) => { neuralCtrl.current = ctrl; }}
            />
          )}
        </div>
      </MnSectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Augmented Brain" collapsible={false}>
          <div className="p-4" style={{ minHeight: 420 }}>
            {effectiveBrainNodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active workers</p>
            ) : (
              <MnAugmentedBrain
                nodes={effectiveBrainNodes}
                connections={effectiveBrainConns}
                height={420}
                size="fluid"
              />
            )}
          </div>
        </MnSectionCard>

        <MnSectionCard title="Brain V2 — Synaptic Map" collapsible={false}>
          <div className="p-4" style={{ minHeight: 420 }}>
            {effectiveBrainV2Nodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active workers</p>
            ) : (
              <MnAugmentedBrainV2
                nodes={effectiveBrainV2Nodes}
                synapses={effectiveBrainV2Synapses}
                stats={effectiveBrainV2Stats}
                title="Worker Synapses"
                showControls
                height={420}
                size="fluid"
              />
            )}
          </div>
        </MnSectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Event Stream" collapsible defaultOpen>
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
            <MnActivityFeed items={effectiveActivityItems} ariaLabel="Real-time event stream" />
          </div>
        </MnSectionCard>

        <MnSectionCard title="System Health" collapsible defaultOpen>
          <div className="p-4">
            <MnSystemStatus
              services={effectiveServices}
              onRefresh={refetchHealth}
              refreshInterval={30_000}
            />
          </div>
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
            {effectiveCosts.length > 0 ? (
              <MnChart
                type="bar"
                labels={costLabels}
                series={costSeries}
                showLegend={false}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No cost data available</p>
            )}
          </div>
        </MnSectionCard>

        <MnSectionCard title="Agent Messages" collapsible defaultOpen>
          <div className="max-h-64 overflow-y-auto p-4">
            {messageEvents.slice(0, 50).map((e, i) => (
                <div
                  key={`${e.ts}-${i}`}
                  className="flex gap-2 border-b border-border py-2 last:border-0"
                >
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {e.from}
                  </span>
                  {e.to && (
                    <span className="text-xs text-muted-foreground">&rarr; {e.to}</span>
                  )}
                  <span className="flex-1 text-xs text-foreground">{e.content}</span>
                  <span className="shrink-0 text-[0.65rem] text-muted-foreground tabular-nums">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            {messageEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">No messages yet</p>
            )}
          </div>
        </MnSectionCard>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, sub, warn,
}: {
  label: string; value: string | number; sub?: string; warn?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${warn ? 'text-destructive' : ''}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
