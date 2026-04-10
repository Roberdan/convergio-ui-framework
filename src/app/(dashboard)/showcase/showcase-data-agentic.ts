/**
 * Showcase sample data — Agentic, Brain & BrainV2 sections.
 */
import type {
  BrainNode, BrainConnection, BinnacleEntry, StripMetric, OrgNode,
  Brain3DNode, Brain3DEdge, BrainV2Node, BrainV2Synapse, BrainV2Stats,
} from '@/components/maranello';

/* ── Agentic ── */

export const brainNodes: BrainNode[] = [
  { id: 'reasoning', label: 'Reasoning', type: 'core', active: true },
  { id: 'planning', label: 'Planning', type: 'core', active: true },
  { id: 'episodic', label: 'Episodic Memory', type: 'memory', active: true },
  { id: 'semantic', label: 'Semantic Memory', type: 'memory' },
  { id: 'code-gen', label: 'Code Generation', type: 'skill', active: true },
  { id: 'analysis', label: 'Analysis', type: 'skill' },
  { id: 'vision', label: 'Vision', type: 'sense' },
  { id: 'speech', label: 'Speech', type: 'sense' },
];

export const brainConnections: BrainConnection[] = [
  { from: 'reasoning', to: 'planning', strength: 0.9 },
  { from: 'reasoning', to: 'episodic', strength: 0.7 },
  { from: 'planning', to: 'code-gen', strength: 0.8 },
  { from: 'episodic', to: 'semantic', strength: 0.6 },
  { from: 'analysis', to: 'reasoning', strength: 0.75 },
  { from: 'vision', to: 'analysis', strength: 0.5 },
  { from: 'speech', to: 'reasoning', strength: 0.4 },
];

export const binnacleEntries: BinnacleEntry[] = [
  { timestamp: '2026-04-01T10:22:14Z', severity: 'info', source: 'coordinator', message: 'Plan 10050 wave WS dispatched to executor' },
  { timestamp: '2026-04-01T10:20:08Z', severity: 'warning', source: 'mesh-relay', message: 'Omarchy node unreachable, retrying in 30s' },
  { timestamp: '2026-04-01T10:18:45Z', severity: 'error', source: 'task-reaper', message: 'Task 10165 timed out after 300s, resetting to pending' },
  { timestamp: '2026-04-01T10:15:00Z', severity: 'info', source: 'daemon', message: 'Health check passed: 3 peers, 101 tables' },
];

export const stripMetrics: StripMetric[] = [
  { label: 'Active Agents', value: 12, trend: 'up' },
  { label: 'Tasks/Hour', value: 8.4, trend: 'up' },
  { label: 'Avg Latency', value: '23ms', trend: 'down' },
  { label: 'Memory', value: '6.2GB', unit: '/ 16GB', trend: 'flat' },
  { label: 'Uptime', value: '99.7%', trend: 'up' },
];

export const orgTree: OrgNode = {
  name: 'Roberto D\'Angelo',
  role: 'Principal Engineer',
  status: 'active',
  children: [
    {
      name: 'Coordinator Opus',
      role: 'Orchestrator',
      status: 'active',
      children: [
        { name: 'Worker Sonnet 01', role: 'Executor', status: 'active' },
        { name: 'Worker Sonnet 02', role: 'Executor', status: 'busy' },
        { name: 'Worker Codex 01', role: 'Executor', status: 'inactive' },
      ],
    },
    {
      name: 'Kernel Jarvis',
      role: 'Local AI (Qwen 7B)',
      status: 'active',
      children: [
        { name: 'Voice Engine', role: 'Voxtral 4B TTS', status: 'active' },
      ],
    },
    { name: 'Thor Validator', role: 'Quality Gate', status: 'active' },
  ],
};

/* ── Brain3D demo ── */

export const brain3DNodes: Brain3DNode[] = [
  { id: 'orch', label: 'Orchestrator', type: 'coordinator', status: 'active', activeTasks: 8, model: 'claude-opus', group: 'control' },
  { id: 'planner', label: 'Planner', type: 'coordinator', status: 'active', activeTasks: 3, model: 'claude-sonnet', group: 'control' },
  { id: 'router', label: 'Router', type: 'coordinator', status: 'active', activeTasks: 5, model: 'gpt-4.1', group: 'control' },
  { id: 'dispatch', label: 'Dispatch Lead', type: 'coordinator', status: 'idle', activeTasks: 1, model: 'claude-sonnet', group: 'control' },
  { id: 'thor', label: 'Thor Validator', type: 'core', status: 'active', activeTasks: 6, group: 'quality' },
  { id: 'kernel', label: 'Kernel', type: 'core', status: 'active', activeTasks: 2, group: 'platform' },
  { id: 'monitor', label: 'Monitor', type: 'core', status: 'active', activeTasks: 1, group: 'ops' },
  { id: 'memory', label: 'Memory Fabric', type: 'core', status: 'active', activeTasks: 4, group: 'platform' },
  { id: 'policy', label: 'Policy Engine', type: 'core', status: 'idle', activeTasks: 1, group: 'governance' },
  { id: 'finops', label: 'FinOps Core', type: 'core', status: 'active', activeTasks: 3, group: 'governance' },
  { id: 'narrative', label: 'Narrative Core', type: 'core', status: 'active', activeTasks: 2, group: 'experience' },
  { id: 'w1', label: 'Worker-01', type: 'worker', status: 'active', model: 'claude-sonnet', activeTasks: 4, group: 'delivery' },
  { id: 'w2', label: 'Worker-02', type: 'worker', status: 'idle', model: 'gpt-4o', activeTasks: 0, group: 'delivery' },
  { id: 'w3', label: 'Worker-03', type: 'worker', status: 'active', model: 'claude-haiku', activeTasks: 2, group: 'ops' },
  { id: 'w4', label: 'Worker-04', type: 'worker', status: 'error', model: 'gpt-4o-mini', activeTasks: 0, group: 'ops' },
  { id: 'w5', label: 'Worker-05', type: 'worker', status: 'active', model: 'claude-sonnet', activeTasks: 1, group: 'research' },
  { id: 'w6', label: 'Worker-06', type: 'worker', status: 'active', model: 'gpt-4.1-mini', activeTasks: 2, group: 'security' },
  { id: 'w7', label: 'Worker-07', type: 'worker', status: 'idle', model: 'claude-sonnet', activeTasks: 0, group: 'design' },
  { id: 'w8', label: 'Worker-08', type: 'worker', status: 'active', model: 'qwen2.5-coder', activeTasks: 3, group: 'platform' },
  { id: 'w9', label: 'Worker-09', type: 'worker', status: 'offline', model: 'gpt-4o', activeTasks: 0, group: 'research' },
  { id: 'w10', label: 'Worker-10', type: 'worker', status: 'active', model: 'claude-haiku', activeTasks: 1, group: 'support' },
  { id: 'w11', label: 'Worker-11', type: 'worker', status: 'error', model: 'claude-sonnet', activeTasks: 0, group: 'deploy' },
  { id: 'w12', label: 'Worker-12', type: 'worker', status: 'active', model: 'gpt-4.1', activeTasks: 5, group: 'executive' },
  { id: 'ext-gh', label: 'GitHub Agent', type: 'extension', status: 'active', activeTasks: 1, group: 'connectors' },
  { id: 'ext-db', label: 'DB Agent', type: 'extension', status: 'active', activeTasks: 3, group: 'connectors' },
  { id: 'ext-search', label: 'Search Agent', type: 'extension', status: 'idle', activeTasks: 0, group: 'connectors' },
  { id: 'ext-deploy', label: 'Deploy Agent', type: 'extension', status: 'offline', activeTasks: 0, group: 'connectors' },
  { id: 'ext-browser', label: 'Browser Agent', type: 'extension', status: 'active', activeTasks: 2, group: 'connectors' },
  { id: 'ext-voice', label: 'Voice Agent', type: 'extension', status: 'idle', activeTasks: 0, group: 'experience' },
  { id: 'ext-slack', label: 'Slack Relay', type: 'extension', status: 'active', activeTasks: 1, group: 'connectors' },
  { id: 'ext-ci', label: 'CI Gate', type: 'extension', status: 'active', activeTasks: 2, group: 'connectors' },
];

export const brain3DEdges: Brain3DEdge[] = [
  { source: 'kernel', target: 'orch', type: 'control', strength: 0.95, active: true },
  { source: 'kernel', target: 'router', type: 'control', strength: 0.88, active: true },
  { source: 'kernel', target: 'dispatch', type: 'control', strength: 0.62, active: true },
  { source: 'kernel', target: 'thor', type: 'control', strength: 0.9, active: true },
  { source: 'kernel', target: 'monitor', type: 'sync', strength: 0.7, active: true },
  { source: 'memory', target: 'orch', type: 'sync', strength: 0.74, active: true },
  { source: 'memory', target: 'planner', type: 'sync', strength: 0.68, active: true },
  { source: 'policy', target: 'thor', type: 'control', strength: 0.56, active: true },
  { source: 'finops', target: 'router', type: 'control', strength: 0.52, active: true },
  { source: 'narrative', target: 'planner', type: 'sync', strength: 0.63, active: true },
  { source: 'orch', target: 'planner', type: 'delegation', strength: 0.85, active: true },
  { source: 'orch', target: 'router', type: 'delegation', strength: 0.78, active: true },
  { source: 'orch', target: 'w1', type: 'delegation', strength: 0.8, active: true },
  { source: 'orch', target: 'w2', type: 'delegation', strength: 0.3 },
  { source: 'orch', target: 'w3', type: 'delegation', strength: 0.7, active: true },
  { source: 'orch', target: 'w4', type: 'delegation', strength: 0.1 },
  { source: 'orch', target: 'w6', type: 'delegation', strength: 0.55, active: true },
  { source: 'planner', target: 'w5', type: 'delegation', strength: 0.6, active: true },
  { source: 'planner', target: 'w7', type: 'delegation', strength: 0.42 },
  { source: 'planner', target: 'w12', type: 'delegation', strength: 0.77, active: true },
  { source: 'router', target: 'w8', type: 'delegation', strength: 0.71, active: true },
  { source: 'router', target: 'w9', type: 'delegation', strength: 0.2 },
  { source: 'dispatch', target: 'w10', type: 'delegation', strength: 0.49, active: true },
  { source: 'dispatch', target: 'w11', type: 'delegation', strength: 0.18 },
  { source: 'w1', target: 'ext-gh', type: 'data', strength: 0.5, active: true },
  { source: 'w3', target: 'ext-db', type: 'data', strength: 0.6, active: true },
  { source: 'w5', target: 'ext-search', type: 'data', strength: 0.3 },
  { source: 'w1', target: 'ext-deploy', type: 'data', strength: 0.2 },
  { source: 'w6', target: 'ext-ci', type: 'data', strength: 0.58, active: true },
  { source: 'w8', target: 'ext-browser', type: 'data', strength: 0.72, active: true },
  { source: 'w10', target: 'ext-slack', type: 'data', strength: 0.45, active: true },
  { source: 'w12', target: 'ext-voice', type: 'data', strength: 0.36 },
  { source: 'thor', target: 'w1', type: 'sync', strength: 0.4, active: true },
  { source: 'thor', target: 'w3', type: 'sync', strength: 0.4, active: true },
  { source: 'thor', target: 'w5', type: 'sync', strength: 0.3 },
  { source: 'thor', target: 'w6', type: 'sync', strength: 0.35, active: true },
  { source: 'thor', target: 'w12', type: 'sync', strength: 0.38, active: true },
  { source: 'monitor', target: 'orch', type: 'control', strength: 0.5, active: true },
  { source: 'monitor', target: 'router', type: 'control', strength: 0.44, active: true },
  { source: 'ext-gh', target: 'thor', type: 'data', strength: 0.35, active: true },
  { source: 'ext-db', target: 'memory', type: 'data', strength: 0.51, active: true },
  { source: 'ext-search', target: 'narrative', type: 'data', strength: 0.28 },
  { source: 'ext-slack', target: 'dispatch', type: 'sync', strength: 0.4, active: true },
  { source: 'ext-ci', target: 'finops', type: 'data', strength: 0.46, active: true },
];

/* ── AugmentedBrainV2 demo ── */

export const brainV2Nodes: BrainV2Node[] = [
  { id: 'hub1', label: '#599 Super Mesh AI Sys', type: 'hub', status: 'active', size: 2 },
  { id: 't1', label: 'Audit MyConvergio code', type: 'task', status: 'active' },
  { id: 't2', label: 'Professional GitHub Wi...', type: 'task', status: 'idle' },
  { id: 't3', label: 'Architecture review an...', type: 'task', status: 'completed' },
  { id: 't4', label: 'Record demo Playwright', type: 'task', status: 'active' },
  { id: 't5', label: 'Complete documentation', type: 'task', status: 'idle' },
  { id: 'a1', label: 'aMox Agent', type: 'agent', status: 'active' },
  { id: 'p1', label: 'Wave WS Plan', type: 'plan', status: 'active' },
];

export const brainV2Synapses: BrainV2Synapse[] = [
  { from: 'hub1', to: 't1', strength: 0.8, active: true },
  { from: 'hub1', to: 't2', strength: 0.4 },
  { from: 'hub1', to: 't3', strength: 0.6 },
  { from: 'hub1', to: 't4', strength: 0.7, active: true },
  { from: 'hub1', to: 't5', strength: 0.3 },
  { from: 'hub1', to: 'a1', strength: 0.9, active: true },
  { from: 'hub1', to: 'p1', strength: 0.5 },
  { from: 'a1', to: 't1', strength: 0.6, active: true },
];

export const brainV2Stats: BrainV2Stats = {
  sessions: 12,
  plans: 3,
  tasks: 49,
  synapses: 92,
};
