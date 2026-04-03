/**
 * Sample data for the Interactive & Admin showcase section.
 */
import type {
  AdminUser,
  SourceCard,
  SocialGraphNode,
  SocialGraphEdge,
  MnNotification,
  TraceStep,
  ApprovalStep,
  FilterSection,
  SearchDrawerResult,
} from '@/components/maranello';

export const adminUsers: AdminUser[] = [
  { id: 'u1', name: 'Roberto D\'Angelo', email: 'roberto@convergio.io', role: 'admin', status: 'active', lastActive: '2026-04-01T10:22:00Z', teams: ['platform', 'strategy'] },
  { id: 'u2', name: 'Elena Marchetti', email: 'elena@convergio.io', role: 'member', status: 'active', lastActive: '2026-04-01T09:45:00Z', teams: ['engineering'] },
  { id: 'u3', name: 'Coordinator Opus', email: 'opus@agents.convergio.io', role: 'member', status: 'active', teams: ['agents'] },
  { id: 'u4', name: 'External Auditor', email: 'auditor@compliance.co', role: 'viewer', status: 'invited', teams: ['compliance'] },
];

export const sourceCards: SourceCard[] = [
  { id: 's1', title: 'Agent Orchestration Patterns', excerpt: 'Best practices for multi-agent coordination using the coordinator–worker topology.', source: 'docs.convergio.io', score: 0.95, date: '2026-03-28', badge: 'Guide' },
  { id: 's2', title: 'FinOps Cost Optimization', excerpt: 'Reduce LLM API spend by up to 40% with prompt caching and model routing.', source: 'blog.convergio.io', score: 0.88, date: '2026-03-15', badge: 'Article' },
  { id: 's3', title: 'Mesh Network Architecture', excerpt: 'Technical overview of the peer-to-peer mesh topology for distributed agents.', source: 'engineering.convergio.io', score: 0.82, date: '2026-02-20' },
  { id: 's4', title: 'EU AI Act Compliance Checklist', excerpt: 'Step-by-step guide for ensuring agent transparency and auditability.', source: 'legal.convergio.io', score: 0.76, date: '2026-01-10', badge: 'Compliance' },
];

export const socialNodes: SocialGraphNode[] = [
  { id: 'n1', label: 'Platform Core', group: 'engineering', size: 30 },
  { id: 'n2', label: 'Agent Layer', group: 'engineering', size: 25 },
  { id: 'n3', label: 'FinOps Module', group: 'product', size: 20 },
  { id: 'n4', label: 'Mesh Network', group: 'engineering', size: 22 },
  { id: 'n5', label: 'UX Design', group: 'design', size: 15 },
  { id: 'n6', label: 'Compliance', group: 'legal', size: 12 },
];

export const socialEdges: SocialGraphEdge[] = [
  { source: 'n1', target: 'n2', weight: 0.9 },
  { source: 'n1', target: 'n3', weight: 0.7 },
  { source: 'n1', target: 'n4', weight: 0.8 },
  { source: 'n2', target: 'n3', weight: 0.5 },
  { source: 'n2', target: 'n4', weight: 0.6 },
  { source: 'n5', target: 'n1', weight: 0.4 },
  { source: 'n6', target: 'n3', weight: 0.3 },
];

export const socialGroups: Record<string, string> = {
  engineering: 'var(--mn-accent)',
  product: 'var(--mn-success)',
  design: 'var(--mn-warning)',
  legal: 'var(--mn-info)',
};

export const notifications: MnNotification[] = [
  { id: 'nt1', title: 'Deployment completed', body: 'v20.8.0 rolled out to all nodes successfully.', type: 'success', read: false, timestamp: '2026-04-01T10:25:00Z' },
  { id: 'nt2', title: 'Budget threshold reached', body: 'GPU compute spend at 83% of monthly budget.', type: 'warning', read: false, timestamp: '2026-04-01T09:00:00Z' },
  { id: 'nt3', title: 'Mesh node offline', body: 'Omarchy node unresponsive for 15 minutes.', type: 'error', read: true, timestamp: '2026-04-01T08:30:00Z' },
  { id: 'nt4', title: 'New agent registered', body: 'worker-sonnet-03 joined the mesh cluster.', type: 'info', read: true, timestamp: '2026-03-31T16:00:00Z' },
];

export const traceSteps: TraceStep[] = [
  { id: 'ts1', kind: 'reasoning', label: 'Analyze user request', status: 'done', durationMs: 340, timestamp: '2026-04-01T10:20:00Z' },
  { id: 'ts2', kind: 'tool', label: 'Query knowledge base', status: 'done', durationMs: 120, input: 'SELECT * FROM plans WHERE status = \'active\'', output: '3 results', timestamp: '2026-04-01T10:20:01Z' },
  { id: 'ts3', kind: 'handoff', label: 'Delegate to worker-sonnet-01', status: 'done', durationMs: 50, timestamp: '2026-04-01T10:20:02Z' },
  { id: 'ts4', kind: 'tool', label: 'Execute code transformation', status: 'running', durationMs: 2100, timestamp: '2026-04-01T10:20:03Z' },
  { id: 'ts5', kind: 'result', label: 'Compose final response', status: 'pending', timestamp: '2026-04-01T10:20:05Z' },
];

export const approvalSteps: ApprovalStep[] = [
  { id: 'ap1', name: 'Roberto D\'Angelo', role: 'Owner', status: 'approved', timestamp: '2026-04-01T09:00:00Z', comment: 'LGTM' },
  { id: 'ap2', name: 'Thor Validator', role: 'Quality Gate', status: 'approved', timestamp: '2026-04-01T09:05:00Z' },
  { id: 'ap3', name: 'Security Review', role: 'Compliance', status: 'current' },
  { id: 'ap4', name: 'Production Deploy', role: 'Ops', status: 'pending' },
];

export const filterSections: FilterSection[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'checkbox',
    options: [
      { id: 'active', label: 'Active', count: 24 },
      { id: 'paused', label: 'Paused', count: 8 },
      { id: 'completed', label: 'Completed', count: 156 },
      { id: 'failed', label: 'Failed', count: 3 },
    ],
  },
  {
    id: 'model',
    label: 'Model',
    type: 'radio',
    options: [
      { id: 'all', label: 'All Models' },
      { id: 'opus', label: 'Claude Opus' },
      { id: 'sonnet', label: 'Claude Sonnet' },
      { id: 'local', label: 'Local (Qwen)' },
    ],
  },
  {
    id: 'cost',
    label: 'Cost Range',
    type: 'range',
    range: { min: 0, max: 100, step: 5 },
  },
];

export const mockSearchResults: SearchDrawerResult[] = [
  { id: 'sr1', title: 'Plan 10050', subtitle: 'Wave WS closure' },
  { id: 'sr2', title: 'Agent coordinator-opus', subtitle: 'Primary orchestrator' },
  { id: 'sr3', title: 'Task 10168', subtitle: 'Organization chart component' },
];
