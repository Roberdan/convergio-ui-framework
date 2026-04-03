// Common API response types

/* ── Overview / Dashboard ── */

export interface OverviewStats {
  activeAgents: number;
  runningPlans: number;
  tasksCompleted: number;
  uptime: number;
  recentPlans: import("./types-plans").PlanSummary[];
  activeAgentList: import("./types-agents").AgentSummary[];
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

export interface ModelTokenUsage {
  model: string;
  prompt: number;
  completion: number;
  total: number;
  cached?: number;
  costPerMToken?: number;
  budget?: number;
}

export interface TaskEvidence {
  id: string;
  taskId: string;
  type: 'log' | 'artifact' | 'screenshot' | 'metric';
  title: string;
  content: string;
  timestamp: string;
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

/* ── Coordinator ── */

export interface CoordinatorEvent {
  id: string;
  agent: string;
  action: string;
  target: string;
  timestamp: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  type?: 'success' | 'error' | 'warning' | 'info';
}

export interface CoordinatorStatus {
  state: 'running' | 'paused' | 'stopped';
  activeAgents: number;
  queuedTasks: number;
  completedToday: number;
  uptime: number;
  lastEvent?: string;
}

/* ── Paginated Response ── */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
