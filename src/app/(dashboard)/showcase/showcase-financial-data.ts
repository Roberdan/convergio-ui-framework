/**
 * Sample data for the Financial & Metrics showcase section.
 */
import type {
  FinOpsMetric,
  AgentCostRow,
  CostSeries,
  KpiRow,
  CohortRow,
  TokenUsage,
} from '@/components/maranello';

export const finOpsMetrics: FinOpsMetric[] = [
  { label: 'GPU Compute', value: 12400, trend: 'up', budget: 15000 },
  { label: 'LLM API Calls', value: 8200, trend: 'down', budget: 10000 },
  { label: 'Storage (NAS)', value: 1800, trend: 'flat', budget: 2000 },
  { label: 'Network Egress', value: 3100, trend: 'up', budget: 3500 },
];

export const agentCostRows: AgentCostRow[] = [
  { id: 'ac1', agentName: 'coordinator-opus', model: 'Claude Opus 4', totalTokens: 2_400_000, cachedTokens: 800_000, cost: 48.20, costDelta: 3.10, calls: 312, avgLatencyMs: 1200, budget: 60, tags: ['orchestration'] },
  { id: 'ac2', agentName: 'worker-sonnet-01', model: 'Claude Sonnet 4', totalTokens: 5_100_000, cachedTokens: 2_200_000, cost: 22.80, costDelta: -1.50, calls: 1024, avgLatencyMs: 450, budget: 30, tags: ['execution'] },
  { id: 'ac3', agentName: 'worker-sonnet-02', model: 'Claude Sonnet 4', totalTokens: 3_800_000, cachedTokens: 1_600_000, cost: 18.40, costDelta: 0.80, calls: 768, avgLatencyMs: 480, budget: 25, tags: ['execution'] },
  { id: 'ac4', agentName: 'kernel-jarvis', model: 'Qwen 7B (local)', totalTokens: 8_200_000, cost: 0, calls: 4096, avgLatencyMs: 85, tags: ['local'] },
];

export const costTimelineLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export const costTimelineSeries: CostSeries[] = [
  { id: 'compute', label: 'GPU Compute', values: [9800, 10200, 11500, 12400, 11900, 12400] },
  { id: 'api', label: 'LLM API', values: [6200, 7100, 8500, 9200, 8800, 8200] },
  { id: 'storage', label: 'Storage', values: [1500, 1600, 1650, 1700, 1750, 1800] },
];

export const kpiRows: KpiRow[] = [
  { id: 'kpi1', label: 'Task Throughput', target: 500, actual: 487, unit: 'tasks/day', trend: [420, 450, 460, 475, 487], status: 'yellow', format: 'number' },
  { id: 'kpi2', label: 'Agent Uptime', target: 99.9, actual: 99.7, unit: '%', trend: [99.5, 99.6, 99.8, 99.7, 99.7], status: 'green', format: 'percent' },
  { id: 'kpi3', label: 'Avg Cost per Task', target: 0.12, actual: 0.14, unit: '$/task', trend: [0.18, 0.16, 0.15, 0.14, 0.14], status: 'yellow', format: 'currency' },
  { id: 'kpi4', label: 'Error Rate', target: 0.5, actual: 1.2, unit: '%', trend: [2.1, 1.8, 1.5, 1.3, 1.2], status: 'red', format: 'percent' },
];

export const cohortRows: CohortRow[] = [
  { label: 'Jan 2026', initialSize: 120, retention: [1, 0.85, 0.72, 0.65, 0.58, 0.52] },
  { label: 'Feb 2026', initialSize: 145, retention: [1, 0.88, 0.76, 0.69, 0.62] },
  { label: 'Mar 2026', initialSize: 168, retention: [1, 0.82, 0.71, 0.64] },
  { label: 'Apr 2026', initialSize: 192, retention: [1, 0.90, 0.78] },
  { label: 'May 2026', initialSize: 210, retention: [1, 0.87] },
];

export const tokenUsage: TokenUsage = {
  prompt: 1_240_000,
  completion: 580_000,
  cached: 420_000,
  budget: 3_000_000,
  costPerMToken: 3.0,
};
