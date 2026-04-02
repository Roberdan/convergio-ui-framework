// Phase 2 sample data for advanced Maranello components (W2-W5).

import type {
  TreemapItem, WaterfallStep, DecisionCriterion, DecisionOption,
  PipelineStage, ActivityItem, MeshNode, MeshEdge,
  HubSpokeHub, HubSpokeSpoke, Deployment, AuditEntry,
  Mission, NightJob, BrainNode, BrainConnection,
  BinnacleEntry, StripMetric, OrgNode,
  CanvasSegment, Force, FinOpsMetric,
  JourneyStage,
} from '@/components/maranello';

// -- Phase 2 W2: Advanced Data Viz --
export const heatmapData = [
  [{ label: 'Mon AM', value: 12 }, { label: 'Tue AM', value: 28 }, { label: 'Wed AM', value: 45 }, { label: 'Thu AM', value: 32 }, { label: 'Fri AM', value: 18 }],
  [{ label: 'Mon PM', value: 38 }, { label: 'Tue PM', value: 52 }, { label: 'Wed PM', value: 67 }, { label: 'Thu PM', value: 41 }, { label: 'Fri PM', value: 55 }],
  [{ label: 'Mon Eve', value: 8 }, { label: 'Tue Eve', value: 15 }, { label: 'Wed Eve', value: 22 }, { label: 'Thu Eve', value: 11 }, { label: 'Fri Eve', value: 5 }],
];

export const treemapItems: TreemapItem[] = [
  { name: 'Infrastructure', value: 42000, color: '#3b82f6' },
  { name: 'AI Models', value: 28000, color: '#8b5cf6' },
  { name: 'Personnel', value: 65000, color: '#22c55e' },
  { name: 'Licensing', value: 15000, color: '#f59e0b' },
  { name: 'Operations', value: 12000, color: '#ef4444' },
];

export const waterfallSteps: WaterfallStep[] = [
  { label: 'Starting Revenue', value: 180000, type: 'total' },
  { label: 'New Contracts', value: 45000, type: 'increase' },
  { label: 'Upsells', value: 18000, type: 'increase' },
  { label: 'Churn', value: -22000, type: 'decrease' },
  { label: 'Ending Revenue', value: 221000, type: 'total' },
];

export const decisionCriteria: DecisionCriterion[] = [
  { name: 'Performance', weight: 0.35 },
  { name: 'Cost Efficiency', weight: 0.25 },
  { name: 'Scalability', weight: 0.25 },
  { name: 'Developer Experience', weight: 0.15 },
];
export const decisionOptions: DecisionOption[] = [
  { name: 'Rust + SQLite', scores: [9, 8, 7, 6] },
  { name: 'Go + PostgreSQL', scores: [7, 7, 9, 8] },
  { name: 'Node.js + MongoDB', scores: [5, 6, 8, 9] },
];

export const pipelineStages: PipelineStage[] = [
  { name: 'Awareness', count: 2400 },
  { name: 'Interest', count: 1680 },
  { name: 'Evaluation', count: 840 },
  { name: 'Trial', count: 420 },
  { name: 'Adoption', count: 252 },
];

export const activityItems: ActivityItem[] = [
  { agent: 'Ali', action: 'completed', target: 'Plan v21 task T4-02', timestamp: '2026-04-01T09:12:00Z', priority: 'high' },
  { agent: 'Rex', action: 'deployed', target: 'Maranello v4.2 to production', timestamp: '2026-04-01T08:45:00Z', priority: 'critical' },
  { agent: 'Sara', action: 'opened', target: 'PR #52: org hardening', timestamp: '2026-04-01T08:30:00Z', priority: 'normal' },
  { agent: 'Luca', action: 'validated', target: 'Thor gate for mesh-sync', timestamp: '2026-04-01T07:55:00Z', priority: 'normal' },
  { agent: 'Marco', action: 'escalated', target: 'Kernel OOM incident', timestamp: '2026-03-31T23:20:00Z', priority: 'high' },
];

// -- Phase 2 W3: Network & Infrastructure --
export const meshNodes: MeshNode[] = [
  { id: 'n1', label: 'M5Max', status: 'online', type: 'coordinator' },
  { id: 'n2', label: 'M1Pro', status: 'online', type: 'kernel' },
  { id: 'n3', label: 'Omarchy', status: 'offline', type: 'worker' },
  { id: 'n4', label: 'ParisRelay', status: 'degraded', type: 'relay' },
];
export const meshEdges: MeshEdge[] = [
  { from: 'n1', to: 'n2', latency: 2 },
  { from: 'n1', to: 'n4', latency: 45 },
  { from: 'n2', to: 'n3' },
  { from: 'n4', to: 'n3', latency: 120 },
];

export const hubSpokeHub: HubSpokeHub = { label: 'M5Max Coordinator', status: 'online' };
export const hubSpokeSpokes: HubSpokeSpoke[] = [
  { label: 'M1Pro Kernel', status: 'online', connected: true },
  { label: 'Omarchy Worker', status: 'offline', connected: false },
  { label: 'Paris Relay', status: 'degraded', connected: true },
  { label: 'London CDN', status: 'online', connected: true },
];

export const deployments: Deployment[] = [
  { node: 'M5Max', version: 'v19.4.0', status: 'deployed', timestamp: '2026-04-01T06:00:00Z', hash: 'a1b2c3d' },
  { node: 'M1Pro', version: 'v19.4.0', status: 'deployed', timestamp: '2026-04-01T06:05:00Z', hash: 'a1b2c3d' },
  { node: 'Omarchy', version: 'v19.3.2', status: 'failed', timestamp: '2026-03-31T22:00:00Z', hash: 'e4f5g6h' },
  { node: 'ParisRelay', version: 'v19.4.0', status: 'rolling', timestamp: '2026-04-01T09:00:00Z', hash: 'a1b2c3d' },
];

export const auditEntries: AuditEntry[] = [
  { timestamp: '2026-04-01T09:12:00Z', actor: 'Ali', action: 'task.complete', target: 'T4-02', detail: 'Marked as submitted' },
  { timestamp: '2026-04-01T08:45:00Z', actor: 'Rex', action: 'deploy.push', target: 'v19.4.0', detail: 'Production rollout' },
  { timestamp: '2026-04-01T08:30:00Z', actor: 'Sara', action: 'pr.create', target: 'PR #52' },
  { timestamp: '2026-03-31T23:20:00Z', actor: 'Marco', action: 'incident.escalate', target: 'INC-042', detail: 'Kernel OOM' },
];

export const missions: Mission[] = [
  { id: 'm1', name: 'Maranello Phase 2 Delivery', progress: 65, status: 'active', agent: 'Ali' },
  { id: 'm2', name: 'Mesh Topology Hardening', progress: 40, status: 'active', agent: 'Rex' },
  { id: 'm3', name: 'Org Service Integration', progress: 100, status: 'completed', agent: 'Sara' },
  { id: 'm4', name: 'Kernel Voice Engine', progress: 15, status: 'paused', agent: 'Marco' },
];

export const nightJobs: NightJob[] = [
  { name: 'DB Backup', schedule: '0 2 * * *', lastRun: '2026-04-01T02:00:00Z', nextRun: '2026-04-02T02:00:00Z', status: 'success' },
  { name: 'Mesh Heartbeat Audit', schedule: '0 3 * * *', lastRun: '2026-04-01T03:00:00Z', nextRun: '2026-04-02T03:00:00Z', status: 'success' },
  { name: 'Token Rotation', schedule: '0 4 * * 1', lastRun: '2026-03-31T04:00:00Z', nextRun: '2026-04-07T04:00:00Z', status: 'scheduled' },
  { name: 'Log Compaction', schedule: '30 1 * * *', lastRun: '2026-04-01T01:30:00Z', nextRun: '2026-04-02T01:30:00Z', status: 'failed' },
];

// -- Phase 2 W4: Agentic & Intelligence --
export const brainNodes: BrainNode[] = [
  { id: 'b1', label: 'Jarvis Core', type: 'core', active: true },
  { id: 'b2', label: 'Long-term Memory', type: 'memory', active: true },
  { id: 'b3', label: 'Code Generation', type: 'skill', active: true },
  { id: 'b4', label: 'Voice Recognition', type: 'sense', active: false },
  { id: 'b5', label: 'Plan Execution', type: 'skill', active: true },
];
export const brainConnections: BrainConnection[] = [
  { from: 'b1', to: 'b2', strength: 0.9 },
  { from: 'b1', to: 'b3', strength: 0.8 },
  { from: 'b1', to: 'b4', strength: 0.3 },
  { from: 'b1', to: 'b5', strength: 0.85 },
  { from: 'b2', to: 'b5', strength: 0.6 },
];

export const binnacleEntries: BinnacleEntry[] = [
  { timestamp: '2026-04-01T09:12:00Z', severity: 'info', source: 'daemon', message: 'Agent Ali registered successfully' },
  { timestamp: '2026-04-01T09:10:00Z', severity: 'warning', source: 'mesh', message: 'Omarchy node unreachable for 120s' },
  { timestamp: '2026-04-01T09:08:00Z', severity: 'error', source: 'kernel', message: 'Qwen inference timeout after 30s' },
  { timestamp: '2026-04-01T09:05:00Z', severity: 'info', source: 'daemon', message: 'Plan v21 checkpoint saved' },
];

export const stripMetrics: StripMetric[] = [
  { label: 'Active Agents', value: 12, trend: 'up' },
  { label: 'Running Plans', value: 3, trend: 'flat' },
  { label: 'Tasks Today', value: 47, trend: 'up' },
  { label: 'Uptime', value: '99.8%', trend: 'up' },
  { label: 'Incidents', value: 1, trend: 'down' },
];

export const orgTree: OrgNode = {
  name: 'Roberto', role: 'Principal Engineer', status: 'active',
  children: [
    { name: 'Ali', role: 'Lead Planner (Opus 4.6)', status: 'active', children: [
      { name: 'Rex', role: 'Executor (Sonnet 4.6)', status: 'active' },
      { name: 'Sara', role: 'Executor (Codex 5.3)', status: 'busy' },
    ]},
    { name: 'Jarvis', role: 'Kernel (Qwen 7B)', status: 'active', children: [
      { name: 'Luca', role: 'Utility (Haiku 4.5)', status: 'active' },
    ]},
    { name: 'Marco', role: 'Coordinator (Sonnet 4.6)', status: 'inactive' },
  ],
};

// -- Phase 2 W5: Strategy & Business Frameworks --
export const strategySegments: CanvasSegment[] = [
  { label: 'Key Partners', items: ['Anthropic', 'Apple Silicon', 'Tailscale'] },
  { label: 'Key Activities', items: ['AI Orchestration', 'Mesh Networking', 'Agent Coordination'] },
  { label: 'Value Propositions', items: ['Unified AI Platform', 'Self-healing Topology', 'Zero SPOF'] },
  { label: 'Customer Segments', items: ['Enterprise DevOps', 'AI-native Teams', 'Platform Engineers'] },
  { label: 'Revenue Streams', items: ['Platform License', 'Support Contracts', 'Custom Integrations'] },
];

export const swotData = {
  strengths: ['Rust performance core', 'Multi-model orchestration', 'Self-healing mesh', 'LAN-first architecture'],
  weaknesses: ['Single maintainer risk', 'M1 Pro memory ceiling', 'Limited documentation coverage'],
  opportunities: ['Enterprise AI adoption wave', 'Edge computing growth', 'Open-source community'],
  threats: ['Major cloud vendor lock-in', 'Rapid model deprecation cycles', 'Regulatory uncertainty'],
};

export const porterForces: Force[] = [
  { name: 'Competitive Rivalry', level: 'high', notes: 'Crowded AI orchestration market' },
  { name: 'Buyer Power', level: 'medium', notes: 'Enterprise switching costs moderate' },
  { name: 'Supplier Power', level: 'high', notes: 'Dependency on model providers' },
  { name: 'Threat of New Entrants', level: 'medium', notes: 'High technical barrier' },
  { name: 'Threat of Substitutes', level: 'low', notes: 'Few unified alternatives' },
];

export const finopsMetrics: FinOpsMetric[] = [
  { label: 'Compute (API)', value: 4250, trend: 'up', budget: 5000 },
  { label: 'Storage', value: 820, trend: 'flat', budget: 1000 },
  { label: 'Network Egress', value: 340, trend: 'down', budget: 500 },
  { label: 'Model Inference', value: 2180, trend: 'up', budget: 2500 },
];

export const journeyStages: JourneyStage[] = [
  { name: 'Discovery', touchpoints: [
    { channel: 'GitHub Repository', sentiment: 'positive' as const },
    { channel: 'Technical Blog', sentiment: 'positive' as const },
  ]},
  { name: 'Evaluation', touchpoints: [
    { channel: 'Documentation', sentiment: 'neutral' as const },
    { channel: 'CLI Setup', sentiment: 'positive' as const },
  ]},
  { name: 'Adoption', touchpoints: [
    { channel: 'First Plan Execution', sentiment: 'positive' as const },
    { channel: 'Mesh Configuration', sentiment: 'negative' as const },
  ]},
  { name: 'Expansion', touchpoints: [
    { channel: 'Multi-node Deployment', sentiment: 'neutral' as const },
    { channel: 'Custom Agent Creation', sentiment: 'positive' as const },
  ]},
];
