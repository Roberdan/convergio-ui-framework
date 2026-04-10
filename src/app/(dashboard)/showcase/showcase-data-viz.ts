/**
 * Showcase sample data — Utilities, Data Viz & Network sections.
 */
import type {
  TreemapItem, WaterfallStep, DecisionCriterion, DecisionOption,
  PipelineStage, ActivityItem, MeshNode, MeshEdge, HubSpokeHub,
  HubSpokeSpoke, Deployment, AuditEntry, Mission, NightJob, Step,
} from '@/components/maranello';

/* ── Utilities ── */

export const stepperSteps: Step[] = [
  { label: 'Requirements', description: 'Gather scope and constraints' },
  { label: 'Architecture', description: 'Design system structure' },
  { label: 'Implementation', description: 'Build and integrate' },
  { label: 'Validation', description: 'Test and verify' },
];

/* ── Data Viz ── */

export const heatmapData = [
  [{ label: 'Mon AM', value: 12 }, { label: 'Mon PM', value: 28 }, { label: 'Mon Eve', value: 8 }],
  [{ label: 'Tue AM', value: 22 }, { label: 'Tue PM', value: 35 }, { label: 'Tue Eve', value: 14 }],
  [{ label: 'Wed AM', value: 18 }, { label: 'Wed PM', value: 42 }, { label: 'Wed Eve', value: 6 }],
  [{ label: 'Thu AM', value: 31 }, { label: 'Thu PM', value: 20 }, { label: 'Thu Eve', value: 11 }],
];

export const treemapItems: TreemapItem[] = [
  { name: 'Infrastructure', value: 42000 },
  { name: 'Engineering', value: 38000 },
  { name: 'Research', value: 24000 },
  { name: 'Operations', value: 18000 },
  { name: 'Marketing', value: 12000 },
];

export const waterfallSteps: WaterfallStep[] = [
  { label: 'Revenue', value: 120000, type: 'total' },
  { label: 'Subscriptions', value: 45000, type: 'increase' },
  { label: 'Consulting', value: 28000, type: 'increase' },
  { label: 'Infrastructure', value: -32000, type: 'decrease' },
  { label: 'Payroll', value: -58000, type: 'decrease' },
  { label: 'Net Margin', value: 103000, type: 'total' },
];

export const decisionCriteria: DecisionCriterion[] = [
  { name: 'Latency', weight: 0.35 },
  { name: 'Throughput', weight: 0.25 },
  { name: 'Cost per query', weight: 0.25 },
  { name: 'Reliability', weight: 0.15 },
];

export const decisionOptions: DecisionOption[] = [
  { name: 'Qwen 7B (local)', scores: [9, 6, 10, 7] },
  { name: 'Claude Sonnet (API)', scores: [5, 9, 4, 9] },
  { name: 'Llama 70B (cluster)', scores: [7, 8, 6, 8] },
];

export const pipelineStages: PipelineStage[] = [
  { name: 'Leads Qualified', count: 340 },
  { name: 'Proposal Sent', count: 210 },
  { name: 'Negotiation', count: 124 },
  { name: 'Contract Signed', count: 78 },
  { name: 'Onboarded', count: 52 },
];

export const activityItems: ActivityItem[] = [
  { agent: 'coordinator-opus', action: 'dispatched', target: 'plan-10050-wave-ws', timestamp: '2026-04-01T10:23:00Z', priority: 'high' },
  { agent: 'worker-sonnet-03', action: 'completed', target: 'task-10168-org-chart', timestamp: '2026-04-01T10:18:00Z', priority: 'normal' },
  { agent: 'kernel-jarvis', action: 'escalated', target: 'memory-pressure-alert', timestamp: '2026-04-01T10:12:00Z', priority: 'critical' },
  { agent: 'mesh-relay', action: 'synced', target: 'dashboard.db replica', timestamp: '2026-04-01T10:05:00Z', priority: 'low' },
];

/* ── Network ── */

export const meshNodes: MeshNode[] = [
  {
    id: 'm3max', label: 'M3-MAX', status: 'online', type: 'coordinator',
    location: 'local', agents: ['CLAUDE', 'COPILOT'], cpu: 42, ram: 61,
    activeTasks: 5, delegatedTasks: 2, syncPercent: 98, latencyMs: 1,
  },
  {
    id: 'm1mario', label: 'M1-MARIO', status: 'online', type: 'worker',
    location: 'local', agents: ['OLLAMA'], cpu: 78, ram: 85,
    activeTasks: 3, driftPercent: 0.2, latencyMs: 2,
  },
  {
    id: 'omarchy', label: 'OMARCHY', status: 'offline', type: 'worker',
    location: 'remote', agents: ['COPILOT'], cpu: 0, ram: 12,
    activeTasks: 0, coldStandby: true,
  },
  {
    id: 'relay-eu', label: 'RELAY-EU', status: 'degraded', type: 'relay',
    location: 'remote', agents: ['CLAUDE'], cpu: 55, ram: 44,
    activeTasks: 1, syncPercent: 87, driftPercent: 1.4, latencyMs: 45,
  },
];

export const meshEdges: MeshEdge[] = [
  { from: 'm3max', to: 'm1mario', latency: 2 },
  { from: 'm3max', to: 'relay-eu', latency: 45 },
  { from: 'm1mario', to: 'omarchy', latency: 0 },
  { from: 'relay-eu', to: 'omarchy', latency: 0 },
];

export const hubSpokeHub: HubSpokeHub = { label: 'M3 Max Coordinator', status: 'online' };

export const hubSpokeSpokes: HubSpokeSpoke[] = [
  { label: 'Kernel (M1 Pro)', status: 'online', connected: true },
  { label: 'Worker Sonnet', status: 'online', connected: true },
  { label: 'Worker Codex', status: 'degraded', connected: true },
  { label: 'Omarchy Node', status: 'offline', connected: false },
];

export const deployments: Deployment[] = [
  { node: 'm3max', version: '20.8.0', status: 'deployed', timestamp: '2026-04-01T09:00:00Z', hash: 'a3b7c92' },
  { node: 'm1mario', version: '20.8.0', status: 'deployed', timestamp: '2026-04-01T09:05:00Z', hash: 'a3b7c92' },
  { node: 'omarchy', version: '20.7.1', status: 'failed', timestamp: '2026-03-31T22:00:00Z', hash: 'f1e8d04' },
  { node: 'relay-eu', version: '20.8.0', status: 'rolling', timestamp: '2026-04-01T10:00:00Z', hash: 'a3b7c92' },
];

export const auditEntries: AuditEntry[] = [
  { timestamp: '2026-04-01T10:22:00Z', actor: 'roberto@example.com', action: 'plan.approved', target: 'plan-10050', detail: 'Wave WS closure approved' },
  { timestamp: '2026-04-01T10:15:00Z', actor: 'coordinator-opus', action: 'task.dispatched', target: 'task-10170' },
  { timestamp: '2026-04-01T09:48:00Z', actor: 'thor-validator', action: 'gate.passed', target: 'plan-10048', detail: 'All 10 gates passed' },
  { timestamp: '2026-04-01T09:30:00Z', actor: 'system', action: 'daemon.restart', target: 'localhost:8420' },
];

export const missions: Mission[] = [
  { id: 'M-401', name: 'Frontend Phase 2 Closure', progress: 85, status: 'active', agent: 'coordinator-opus' },
  { id: 'M-398', name: 'Mesh Heartbeat Hardening', progress: 100, status: 'completed', agent: 'worker-sonnet-02' },
  { id: 'M-399', name: 'Org Hierarchy API', progress: 60, status: 'paused', agent: 'worker-codex-01' },
  { id: 'M-400', name: 'Voice Engine Integration', progress: 12, status: 'active', agent: 'worker-sonnet-03' },
];

export const nightJobs: NightJob[] = [
  { name: 'DB Vacuum & Optimize', schedule: '0 3 * * *', lastRun: '2026-04-01T03:00:00Z', nextRun: '2026-04-02T03:00:00Z', status: 'success' },
  { name: 'Mesh Sync Validation', schedule: '0 4 * * *', lastRun: '2026-04-01T04:00:00Z', nextRun: '2026-04-02T04:00:00Z', status: 'failed' },
  { name: 'Log Rotation', schedule: '30 2 * * *', lastRun: '2026-04-01T02:30:00Z', nextRun: '2026-04-02T02:30:00Z', status: 'success' },
  { name: 'Backup to NAS', schedule: '0 5 * * *', lastRun: '2026-03-31T05:00:00Z', nextRun: '2026-04-01T05:00:00Z', status: 'scheduled' },
];
