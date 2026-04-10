import type { CostSummary, IpcEvent } from '@/lib/types';
import type { Service } from '@/components/maranello/network';
import type { ActivityItem } from '@/components/maranello/feedback';

export type EventFilter =
  | ''
  | 'MessageSent'
  | 'TaskAssigned'
  | 'TaskCompleted'
  | 'DelegationStarted';

export const FILTERS: { label: string; value: EventFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Messages', value: 'MessageSent' },
  { label: 'Tasks', value: 'TaskAssigned' },
  { label: 'Completed', value: 'TaskCompleted' },
  { label: 'Delegations', value: 'DelegationStarted' },
];

export const CAT_COLORS: Record<string, string> = {
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

export const DEMO_SUMMARY = {
  activeAgents: 28,
  externalAgents: 8,
  queueDepth: 41,
  totalSpentUsd: 2847.32,
  totalBudgetUsd: 6500,
  staleCount: 4,
};

export const DEMO_SERVICES: Service[] = [
  { id: 'api', name: 'Control API', status: 'operational', uptime: 99.98, latencyMs: 82 },
  { id: 'mesh', name: 'Agent mesh', status: 'operational', uptime: 99.94, latencyMs: 109 },
  { id: 'night', name: 'Night runs', status: 'degraded', uptime: 98.7, latencyMs: 241 },
];

export const DEMO_COSTS: CostSummary[] = [
  { entity_id: 'coordinator-opus', entity_type: 'agent', daily_cost: 128, monthly_cost: 2840, model: 'claude-opus' },
  { entity_id: 'worker-sonnet-03', entity_type: 'agent', daily_cost: 94, monthly_cost: 1980, model: 'claude-sonnet' },
  { entity_id: 'thor-validator', entity_type: 'agent', daily_cost: 58, monthly_cost: 1120, model: 'claude-haiku' },
  { entity_id: 'kernel-qwen', entity_type: 'node', daily_cost: 37, monthly_cost: 840, model: 'qwen2.5-coder' },
];

export const DEMO_MESSAGES: IpcEvent[] = [
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

export const DEMO_STRIP_ZONES = [
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

export function healthToService(c: {
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

export function eventToActivity(e: IpcEvent): ActivityItem {
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
