import type { Agent, IpcEvent, RuntimeView, RuntimeWorker } from '@/lib/types';
import type {
  NeuralNodeData,
  NeuralConnection,
  BrainNode,
  BrainConnection,
  BrainV2Node,
  BrainV2Synapse,
  BrainV2Stats,
  Brain3DNode,
  Brain3DEdge,
} from '@/components/maranello/agentic';
import type { HubSpokeSpoke } from '@/components/maranello/agentic';
import type { Service } from '@/components/maranello/network';
import { discoveredToBrainV1, discoveredToBrainV2, discoveredToBrain3D } from '../brain-helpers';
import { CAT_COLORS } from './dashboard-page.data';

export function buildNeuralGraph(
  agents: Agent[] | null | undefined,
  events: IpcEvent[],
): { neuralNodes: NeuralNodeData[]; neuralConns: NeuralConnection[] } {
  const catalog = new Map((agents ?? []).map((a) => [a.name, a]));
  const activeNames = new Set(
    events.flatMap((e) => [e.from, e.to].filter(Boolean) as string[]),
  );
  if (activeNames.size === 0) {
    return { neuralNodes: [], neuralConns: [] };
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
}

export function buildHubSpokeData(services: Service[]): HubSpokeSpoke[] {
  return services.slice(0, 8).map((s) => ({
    label: s.name,
    status:
      s.status === 'operational'
        ? ('online' as const)
        : s.status === 'degraded'
          ? ('degraded' as const)
          : ('offline' as const),
    connected: s.status !== 'outage',
  }));
}

export function buildBrainV1(
  runtime: RuntimeView | null | undefined,
): { brainNodes: BrainNode[]; brainConns: BrainConnection[] } {
  const workers = runtime?.active_agents ?? [];
  const discovered = runtime?.discovered_agents ?? [];
  if (workers.length === 0 && discovered.length === 0) {
    return { brainNodes: [], brainConns: [] };
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
}

export function buildBrainV2(
  runtime: RuntimeView | null | undefined,
): { brainV2Nodes: BrainV2Node[]; brainV2Synapses: BrainV2Synapse[]; brainV2Stats: BrainV2Stats } {
  const workers = runtime?.active_agents ?? [];
  const discovered = runtime?.discovered_agents ?? [];
  if (workers.length === 0 && discovered.length === 0) {
    return {
      brainV2Nodes: [],
      brainV2Synapses: [],
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
}

export function buildBrain3D(
  runtime: RuntimeView | null | undefined,
): { brain3DNodes: Brain3DNode[]; brain3DEdges: Brain3DEdge[] } {
  const workers = runtime?.active_agents ?? [];
  const discovered = runtime?.discovered_agents ?? [];
  if (workers.length === 0 && discovered.length === 0) {
    return { brain3DNodes: [], brain3DEdges: [] };
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
}

export function buildDemoNeural(
  demoBrain3DSeed: Brain3DNode[],
  demoBrain3DEdgeSeed: Brain3DEdge[],
): { nodes: NeuralNodeData[]; conns: NeuralConnection[] } {
  return {
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
  };
}
