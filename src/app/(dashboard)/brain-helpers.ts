/**
 * Maps discovered (external) agents into brain visualization node/edge shapes
 * so they appear in Brain3D, BrainV1, and BrainV2 alongside managed workers.
 */
import type { DiscoveredAgent } from '@/lib/types';
import type {
  BrainNode,
  BrainConnection,
  BrainV2Node,
  BrainV2Synapse,
  Brain3DNode,
  Brain3DEdge,
} from '@/components/maranello/agentic';

const TYPE_COLORS: Record<string, string> = {
  'external-claude': '#3b82f6',
  'external-copilot': '#f59e0b',
  'external-mlx': '#22c55e',
};

function nodeType(agentType: string): string {
  if (agentType.includes('claude')) return 'claude';
  if (agentType.includes('copilot')) return 'copilot';
  if (agentType.includes('mlx')) return 'mlx';
  return 'external';
}

function shortLabel(agent: DiscoveredAgent): string {
  const t = nodeType(agent.agent_type);
  const host = agent.host.split('.')[0];
  return `${t}@${host}`;
}

export function discoveredToBrainV1(
  agents: DiscoveredAgent[],
  hubId?: string,
): { nodes: BrainNode[]; conns: BrainConnection[] } {
  const typeToLayer: Record<string, BrainNode['type']> = {
    'external-claude': 'core',
    'external-copilot': 'skill',
    'external-mlx': 'memory',
  };
  const nodes: BrainNode[] = agents.map((a) => ({
    id: `ext-${a.name}`,
    label: shortLabel(a),
    type: typeToLayer[a.agent_type] ?? 'sense',
    active: true,
  }));
  const conns: BrainConnection[] = [];
  if (hubId) {
    for (const n of nodes) {
      conns.push({ from: hubId, to: n.id, strength: 0.4 });
    }
  }
  return { nodes, conns };
}

export function discoveredToBrainV2(
  agents: DiscoveredAgent[],
  hubId: string,
): { nodes: BrainV2Node[]; synapses: BrainV2Synapse[] } {
  const nodes: BrainV2Node[] = agents.map((a) => ({
    id: `ext-${a.name}`,
    label: shortLabel(a),
    type: 'agent' as BrainV2Node['type'],
    status: 'active' as BrainV2Node['status'],
    size: a.agent_type === 'external-mlx' ? 1.3 : 1,
  }));
  const synapses: BrainV2Synapse[] = nodes.map((n) => ({
    from: hubId,
    to: n.id,
    strength: 0.5,
    active: true,
  }));
  return { nodes, synapses };
}

export function discoveredToBrain3D(
  agents: DiscoveredAgent[],
  coordinatorId: string,
): { nodes: Brain3DNode[]; edges: Brain3DEdge[] } {
  const nodes: Brain3DNode[] = agents.map((a) => ({
    id: `ext-${a.name}`,
    label: shortLabel(a),
    type: 'worker' as const,
    status: 'active' as const,
    model: a.agent_type.replace('external-', ''),
    activeTasks: a.agent_type === 'external-mlx' ? 0 : 1,
    group: a.host,
  }));
  const edges: Brain3DEdge[] = nodes.map((n) => ({
    source: coordinatorId,
    target: n.id,
    type: 'sync' as Brain3DEdge['type'],
    strength: 0.5,
    active: true,
  }));
  return { nodes, edges };
}
