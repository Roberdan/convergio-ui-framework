// Realistic sample data for Maranello components (W1-W4 core).

import type {
  BreadcrumbItem, CommandItem, SectionNavItem,
  DataTableColumn, DetailSection, FacetGroup,
  ChatMessage, QuickAction, Objective, Service, Incident,
  ChartSeries, FunnelStage, HBarItem, GanttTask,
  KanbanColumn, KanbanCard, MapMarker,
} from '@/components/maranello';

// -- Primitives --
export const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Platform', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Maranello v4.2', current: true },
];

// -- Shell --
export const commandItems: CommandItem[] = [
  { text: 'Open Dashboard', icon: '\u2302', shortcut: '\u2318D', group: 'Navigation' },
  { text: 'View Agents', icon: '\u2693', shortcut: '\u2318A', group: 'Navigation' },
  { text: 'Deploy Release', icon: '\u2191', group: 'Actions' },
  { text: 'Run Health Check', icon: '\u2713', group: 'Actions' },
  { text: 'Toggle Dark Mode', icon: '\u263D', group: 'Settings' },
];

export const sectionNavItems: SectionNavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'agents', label: 'Agents' },
  { id: 'deployments', label: 'Deployments' },
  { id: 'logs', label: 'Logs' },
];

// -- Data --
export const tableColumns: DataTableColumn[] = [
  { key: 'agent', label: 'Agent', sortable: true, filterable: true },
  { key: 'model', label: 'Model', sortable: true },
  { key: 'tasks', label: 'Tasks', sortable: true, align: 'right' },
  { key: 'status', label: 'Status' },
];

export const tableRows = [
  { agent: 'Ali', model: 'Opus 4.6', tasks: 47, status: 'active' },
  { agent: 'Rex', model: 'Sonnet 4.6', tasks: 32, status: 'active' },
  { agent: 'Luca', model: 'Haiku 4.5', tasks: 18, status: 'idle' },
  { agent: 'Sara', model: 'Codex 5.3', tasks: 61, status: 'active' },
  { agent: 'Marco', model: 'Opus 4.6', tasks: 29, status: 'busy' },
];

export const detailSections: DetailSection[] = [
  {
    title: 'Identity', fields: [
      { key: 'name', label: 'Agent Name', value: 'Ali', type: 'text' },
      { key: 'model', label: 'Model', value: 'opus-4.6', type: 'select', options: [
        { value: 'opus-4.6', label: 'Opus 4.6' },
        { value: 'sonnet-4.6', label: 'Sonnet 4.6' },
      ]},
      { key: 'active', label: 'Active', value: true, type: 'boolean' },
    ],
  },
  {
    title: 'Performance', fields: [
      { key: 'tasks', label: 'Tasks Completed', value: 47, type: 'number' },
      { key: 'uptime', label: 'Uptime', value: '99.8%', type: 'readonly' },
    ],
  },
];

export const facetGroups: FacetGroup[] = [
  { id: 'status', label: 'Status', options: [
    { id: 'active', label: 'Active', count: 8 },
    { id: 'idle', label: 'Idle', count: 3 },
    { id: 'error', label: 'Error', count: 1 },
  ]},
  { id: 'model', label: 'Model', options: [
    { id: 'opus', label: 'Opus 4.6', count: 4 },
    { id: 'sonnet', label: 'Sonnet 4.6', count: 5 },
    { id: 'haiku', label: 'Haiku 4.5', count: 3 },
  ]},
];

export const chatMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'What is the current deployment status?', timestamp: new Date('2026-04-01T09:15:00') },
  { id: '2', role: 'assistant', content: 'All 3 nodes are running **v19.4.0**. The M5Max coordinator shows `99.8%` uptime. No incidents in the last 24 hours.', timestamp: new Date('2026-04-01T09:15:05') },
  { id: '3', role: 'user', content: 'Show me the mesh health', timestamp: new Date('2026-04-01T09:16:00') },
];

export const quickActions: QuickAction[] = [
  { label: 'Run diagnostics', action: 'diagnostics' },
  { label: 'Show agents', action: 'agents' },
  { label: 'Deploy latest', action: 'deploy' },
];

export const objectives: Objective[] = [
  { id: 'o1', title: 'Ship Maranello Phase 2 Components', status: 'on-track', keyResults: [
    { id: 'kr1', title: 'Strategy frameworks', current: 5, target: 5 },
    { id: 'kr2', title: 'Network visualizations', current: 4, target: 6 },
    { id: 'kr3', title: 'Agentic intelligence widgets', current: 3, target: 5 },
  ]},
  { id: 'o2', title: 'Achieve 99.9% Platform Uptime', status: 'at-risk', keyResults: [
    { id: 'kr4', title: 'Monthly uptime percentage', current: 99.7, target: 99.9, unit: '%' },
    { id: 'kr5', title: 'Mean time to recovery (min)', current: 4, target: 3, unit: 'min' },
  ]},
];

export const services: Service[] = [
  { id: 'daemon', name: 'Convergio Daemon', status: 'operational', uptime: 99.98, latencyMs: 12 },
  { id: 'kernel', name: 'Jarvis Kernel (Qwen 7B)', status: 'operational', uptime: 99.5, latencyMs: 85 },
  { id: 'mesh', name: 'Mesh Network', status: 'degraded', uptime: 98.2, latencyMs: 340 },
  { id: 'telegram', name: 'Telegram Integration', status: 'operational', uptime: 100, latencyMs: 45 },
];

export const incidents: Incident[] = [
  { id: 'inc-1', title: 'Mesh latency spike on M1Pro node', date: '01 Apr 2026, 08:42 CET', severity: 'degraded' },
  { id: 'inc-2', title: 'Kernel restart after OOM', date: '31 Mar 2026, 23:15 CET', severity: 'outage', resolved: true },
];

// -- Charts --
export const chartSeries: ChartSeries[] = [
  { label: 'Tasks Completed', data: [12, 19, 8, 25, 14, 22, 30], color: 'var(--mn-accent)' },
  { label: 'Tasks Failed', data: [2, 1, 3, 0, 1, 2, 0], color: 'var(--mn-error)' },
];
export const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const funnelData = {
  pipeline: [
    { label: 'Proposals', count: 420 },
    { label: 'Qualified', count: 280 },
    { label: 'Negotiation', count: 145 },
    { label: 'Won', count: 68 },
  ] as FunnelStage[],
  total: 420,
};

export const hbarItems: HBarItem[] = [
  { label: 'Opus 4.6', value: 847 },
  { label: 'Sonnet 4.6', value: 623 },
  { label: 'Codex 5.3', value: 412 },
  { label: 'Haiku 4.5', value: 198 },
];

export const ganttTasks: GanttTask[] = [
  { id: 'g1', title: 'Phase 2 W1 - Accessibility', start: '2026-03-15', end: '2026-03-22', status: 'completed', progress: 100 },
  { id: 'g2', title: 'Phase 2 W2 - Data Viz', start: '2026-03-22', end: '2026-03-29', status: 'completed', progress: 100 },
  { id: 'g3', title: 'Phase 2 W3 - Network', start: '2026-03-29', end: '2026-04-05', status: 'active', progress: 60 },
  { id: 'g4', title: 'Phase 2 W4 - Agentic', start: '2026-04-05', end: '2026-04-12', status: 'planned', progress: 0 },
  { id: 'g5', title: 'Phase 2 W5 - Strategy', start: '2026-04-12', end: '2026-04-19', status: 'planned', progress: 0 },
];

export const kanbanColumns: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', color: '#6b7280' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'review', title: 'Review', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#22c55e' },
];
export const kanbanCards: KanbanCard[] = [
  { id: 'k1', columnId: 'backlog', title: 'Implement Porter Five Forces', assignee: 'Sara', priority: 'medium' },
  { id: 'k2', columnId: 'in-progress', title: 'Mesh Network Visualization', assignee: 'Rex', priority: 'high', tags: ['Phase 2'] },
  { id: 'k3', columnId: 'review', title: 'Org Chart Component', assignee: 'Ali', priority: 'medium' },
  { id: 'k4', columnId: 'done', title: 'Budget Treemap Widget', assignee: 'Marco', priority: 'low' },
  { id: 'k5', columnId: 'in-progress', title: 'SWOT Analysis Grid', assignee: 'Luca', priority: 'high', tags: ['Strategy'] },
];

export const mapMarkers: MapMarker[] = [
  { id: 1, lat: 45.464, lon: 9.190, label: 'Milano HQ', detail: 'M5Max Coordinator', color: 'active', size: 'lg' },
  { id: 2, lat: 41.902, lon: 12.496, label: 'Roma Office', detail: 'M1Pro Kernel Node', color: 'active' },
  { id: 3, lat: 48.856, lon: 2.352, label: 'Paris Edge', detail: 'Relay Node', color: 'warning' },
  { id: 4, lat: 51.507, lon: -0.128, label: 'London CDN', detail: 'CDN Endpoint', color: 'active' },
];

// Phase 2 W1
export const stepperSteps = [
  { label: 'Configure', description: 'Set up agent parameters' },
  { label: 'Deploy', description: 'Push to mesh network' },
  { label: 'Verify', description: 'Run health checks' },
  { label: 'Monitor', description: 'Track performance metrics' },
];
