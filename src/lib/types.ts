/**
 * Backend daemon API types.
 * Derived from convergio daemon crates (ext.rs route handlers).
 */

/* ── System ── */
export interface HealthResponse { status: string; timestamp: string }
export interface DeepHealthComponent {
  name: string;
  status: 'ok' | 'degraded' | 'down';
  latency_ms?: number;
  message?: string;
}
export interface DeepHealthResponse { components: DeepHealthComponent[] }
export interface Metric { name: string; value: number; unit?: string; labels?: Record<string, string> }
export interface MetricsResponse { metrics: Metric[] }

/* ── Agents ── */
export interface RuntimeView {
  active_agents: number;
  queue_depth: number;
  total_budget_usd: number;
  total_spent_usd: number;
  delegations_active: number;
  stale_count: number;
}
export interface Agent {
  name: string;
  description: string;
  model: string;
  tier: string;
  capabilities: string[];
  budget_usd: number;
  category?: string;
}
export interface AgentInput {
  name: string;
  description: string;
  model: string;
  tier: string;
  capabilities: string[];
  budget_usd: number;
}

/* ── Billing ── */
export interface UsageCategory { category: string; quantity: number; cost: number }
export interface UsageResponse {
  org_id: string;
  daily_cost: number;
  monthly_cost: number;
  categories: UsageCategory[];
}
export interface Invoice {
  id: string;
  org_id: string;
  amount: number;
  currency: string;
  status: string;
  period_start: string;
  period_end: string;
}
export interface RateCard { id: string; capability: string; unit: string; rate: number }
export interface AlertRequest {
  entity_id: string;
  scope: 'platform' | 'agent' | 'org';
  daily_limit_usd: number;
  monthly_limit_usd: number;
  auto_pause: boolean;
}

/* ── Inference ── */
export interface CostSummary {
  entity_id: string;
  entity_type: string;
  daily_cost: number;
  monthly_cost: number;
  model: string;
}
export interface ModelMetric {
  model: string;
  latency_ms: number;
  cost_per_1k_tokens: number;
  quality_score: number;
}
export interface RoutingResponse { decision: string; model_metrics: ModelMetric[] }

/* ── Observatory ─��� */
export interface TimelineEvent {
  id: string;
  timestamp: string;
  org_id?: string;
  source?: string;
  event_type: string;
  node_id?: string;
  payload: Record<string, unknown>;
}
export interface SearchResult { id: string; timestamp: string; kind: string; excerpt: string; score: number }
export interface ObservatoryDashboard {
  cost_per_hour: number;
  tasks_per_day: number;
  avg_latency_ms: number;
  model_breakdown: Record<string, number>;
}
export interface Anomaly {
  id: string;
  kind: string;
  severity: string;
  message: string;
  detected_at: string;
  resolved: boolean;
}

/* ��─ Prompts & Skills ── */
export interface Prompt {
  id: string;
  name: string;
  version: number;
  active: boolean;
  template: string;
  created_at: string;
}
export interface PromptInput { name: string; template: string; active?: boolean }
export interface Skill {
  id: string;
  name: string;
  description: string;
  category?: string;
  capabilities: string[];
}
export interface SkillInput { name: string; description: string; category?: string; capabilities: string[] }

/* ── Organizations ── */
export interface Org {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'suspended' | 'archived';
  budget_usd: number;
  spent_usd: number;
  agent_count: number;
  created_at: string;
}
export interface OrgInput {
  name: string;
  description?: string;
  budget_usd: number;
}
export interface OrgDelegation {
  id: string;
  from_org: string;
  to_org: string;
  capability: string;
  status: 'active' | 'revoked';
  created_at: string;
}

/* ── Plans & Tasks ── */
export interface Plan {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  wave_count: number;
  task_count: number;
  completed_tasks: number;
  created_at: string;
  org_id?: string;
}
export interface PlanInput { name: string; org_id?: string; description?: string }
export interface Wave {
  id: string;
  plan_id: string;
  index: number;
  status: 'pending' | 'in_progress' | 'completed';
  tasks: Task[];
}
export interface Task {
  id: string;
  plan_id: string;
  wave_id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'done' | 'failed';
  assignee?: string;
  evidence?: string[];
  thor_validated?: boolean;
  created_at: string;
}

/* ── Mesh ── */
export interface MeshNode {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'syncing';
  last_sync?: string;
  schema_version?: string;
  latency_ms?: number;
}

/* ── Multitenancy ���─ */
export interface PeerEntry { peer_name: string; peer_url?: string; allowed: boolean }
export interface AuditEntry {
  id: string;
  timestamp: string;
  org_id: string;
  action: string;
  actor: string;
  details?: Record<string, unknown>;
}
export interface ResourceStatus {
  org_id: string;
  max_cpu_seconds_per_hour?: number;
  max_memory_mb?: number;
  max_storage_mb?: number;
  max_concurrent_agents?: number;
  max_api_calls_per_minute?: number;
  current_cpu_seconds?: number;
  current_memory_mb?: number;
  current_storage_mb?: number;
  current_agents?: number;
}

/* ���─ Extensions ── */
export interface ExtensionInfo {
  id: string;
  manifest_url?: string;
  health_check_url?: string;
  capabilities: string[];
  status: string;
}

/* ── Dependency Graph ── */
export interface DepGraph {
  nodes: { id: string; label: string; kind: string }[];
  edges: { from: string; to: string; label?: string }[];
}
export interface DepGraphValidation { valid: boolean; errors: string[] }

/* ── Backup ── */
export interface Snapshot { id: string; label?: string; created_at: string; size_bytes: number }

/* ── SSE Domain Events ── */
export interface IpcEvent { from: string; to?: string; content: string; event_type: string; ts: string }
export type DomainEventType =
  | 'PlanCreated' | 'TaskAssigned' | 'TaskCompleted'
  | 'MessageSent' | 'DelegationStarted'
  | 'AgentOnline' | 'AgentOffline'
  | 'HealthDegraded' | 'BudgetAlert' | 'ExtensionLoaded';
