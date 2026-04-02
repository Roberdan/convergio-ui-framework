// API response types for the Convergio daemon (http://localhost:8420)

/* ── Overview / Dashboard ── */

export interface OverviewStats {
  activeAgents: number;
  runningPlans: number;
  tasksCompleted: number;
  uptime: number;
  recentPlans: PlanSummary[];
  activeAgentList: AgentSummary[];
}

export interface BrainData {
  nodes: { id: string; label: string; type: 'core' | 'memory' | 'skill' | 'sense'; active?: boolean }[];
  connections: { from: string; to: string; strength: number }[];
}

export interface TokenUsage {
  date: string;
  input: number;
  output: number;
  total: number;
}

export interface TaskDistribution {
  status: string;
  count: number;
}

/* ── Plans ── */

export interface PlanSummary {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  progress: number;
}

export interface PlanDetail extends PlanSummary {
  description: string;
  tasks: PlanTask[];
  metadata: Record<string, unknown>;
}

export interface PlanTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'done' | 'failed';
  assignee?: string;
  start?: string;
  end?: string;
  dependencies?: string[];
  children?: PlanTask[];
}

export interface ExecutionTree {
  planId: string;
  root: PlanTask;
}

export interface CreatePlanRequest {
  title: string;
  description?: string;
  tasks?: { title: string; assignee?: string }[];
}

/* ── Agents ── */

export interface AgentSummary {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  model?: string;
  taskCount: number;
}

export interface AgentCatalogEntry {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  model: string;
  provider: string;
}

export interface AgentSession {
  sessionId: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'idle' | 'terminated';
  startedAt: string;
  lastActivity: string;
}

export interface AgentTree {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'busy' | 'error';
  children?: AgentTree[];
}

export interface TriageRequest {
  query: string;
  context?: string;
}

export interface TriageResult {
  agentId: string;
  agentName: string;
  confidence: number;
  reasoning: string;
}

/* ── Organizations ── */

export interface Organization {
  id: string;
  slug: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
}

export interface OrgDetail extends Organization {
  members: OrgMember[];
  metadata: Record<string, unknown>;
}

export interface OrgMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface OrgChartData {
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'busy' | 'error';
  children?: OrgChartData[];
}

export interface OrgMetrics {
  totalMembers: number;
  activeMembers: number;
  tasksCompleted: number;
  planCount: number;
  tokenUsage: number;
}

export interface OrgTimelineEvent {
  timestamp: string;
  type: string;
  description: string;
  actor: string;
}

export interface CreateOrgRequest {
  name: string;
  slug: string;
  description?: string;
}

/* ── Mesh / Infrastructure ── */

export interface MeshTopology {
  nodes: MeshNodeData[];
  edges: MeshEdgeData[];
}

export interface MeshNodeData {
  id: string;
  label: string;
  status: 'online' | 'offline' | 'degraded';
  type: 'coordinator' | 'worker' | 'kernel' | 'relay';
}

export interface MeshEdgeData {
  from: string;
  to: string;
  latency?: number;
}

export interface MeshMetrics {
  totalNodes: number;
  onlineNodes: number;
  avgLatency: number;
  messageRate: number;
}

export interface HeartbeatStatus {
  peerId: string;
  lastSeen: string;
  status: 'healthy' | 'stale' | 'dead';
  latencyMs: number;
}

export interface PeerInfo {
  id: string;
  address: string;
  version: string;
  status: 'connected' | 'disconnected';
  connectedAt: string;
}

/* ── Chat / AI ── */

export interface ChatSession {
  sessionId: string;
  createdAt: string;
  agentId?: string;
}

export interface ChatMessageRequest {
  sessionId: string;
  message: string;
  agentId?: string;
}

export interface ChatMessageResponse {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: string;
}

export interface InferenceProvider {
  id: string;
  name: string;
  status: 'available' | 'unavailable' | 'degraded';
  models: string[];
  latencyMs?: number;
}

/* ── Operations ── */

export interface NightlyJob {
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'success' | 'running' | 'failed' | 'skipped' | 'scheduled';
}

export interface ExecutionRun {
  id: string;
  planId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  finishedAt?: string;
  duration?: number;
}

export interface AuditLogEntry {
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

/* ── Settings / System ── */

export interface DeepHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthService[];
  uptime: number;
  version: string;
}

export interface HealthService {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime?: number;
  latencyMs?: number;
}

export interface ReadinessCheck {
  name: string;
  ready: boolean;
  message?: string;
}

export interface KernelStatus {
  status: 'running' | 'stopped' | 'starting';
  pid?: number;
  uptime?: number;
  memory?: number;
  cpu?: number;
}

export interface NotificationChannel {
  id: string;
  type: 'slack' | 'email' | 'webhook' | 'sms';
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

/* ── Ideas ── */

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'evaluating' | 'approved' | 'rejected' | 'promoted';
  author: string;
  createdAt: string;
  votes: number;
  tags: string[];
}

export interface CreateIdeaRequest {
  title: string;
  description: string;
  tags?: string[];
}

/* ── Paginated Response ── */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
