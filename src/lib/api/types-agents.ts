// Agent-related API types

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

export interface AgentHistoryEntry {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  target: string;
  status: 'success' | 'error' | 'running';
  timestamp: string;
  durationMs?: number;
  tokensUsed?: number;
  cost?: number;
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
