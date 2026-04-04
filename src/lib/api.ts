/**
 * Typed HTTP client for the Convergio daemon API (:8420).
 *
 * All functions throw ApiError on non-2xx responses.
 * Use with useApiQuery hook for React components.
 */

import { ApiError } from '@/hooks/use-api-query';
import type {
  HealthResponse,
  DeepHealthResponse,
  MetricsResponse,
  RuntimeView,
  Agent,
  AgentInput,
  UsageResponse,
  Invoice,
  RateCard,
  AlertRequest,
  CostSummary,
  RoutingResponse,
  TimelineEvent,
  SearchResult,
  ObservatoryDashboard,
  Anomaly,
  Prompt,
  PromptInput,
  Skill,
  SkillInput,
  Org,
  OrgInput,
  OrgDelegation,
  Plan,
  PlanInput,
  Wave,
  MeshNode,
  ExtensionInfo,
  DepGraph,
  DepGraphValidation,
  PeerEntry,
  AuditEntry,
  ResourceStatus,
  Snapshot,
} from './types';

const BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8420')
    : (process.env.API_URL ?? 'http://localhost:8420');

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, text);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function get<T>(path: string) {
  return request<T>('GET', path);
}
function post<T>(path: string, body?: unknown) {
  return request<T>('POST', path, body);
}
function put<T>(path: string, body?: unknown) {
  return request<T>('PUT', path, body);
}
function del<T>(path: string) {
  return request<T>('DELETE', path);
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined,
  );
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)]),
  ).toString();
}

/* ── System ── */

export const health = () => get<HealthResponse>('/api/health');
export const healthDeep = () => get<DeepHealthResponse>('/api/health/deep');
export const metrics = () => get<MetricsResponse>('/api/metrics');

/* ── Agents ── */

export const agentRuntime = () => get<RuntimeView>('/api/agents/runtime');

export const agentList = (p?: {
  category?: string;
  limit?: number;
  offset?: number;
}) => get<Agent[]>(`/api/agents/catalog${qs(p ?? {})}`);

export const agentGet = (name: string) =>
  get<Agent>(`/api/agents/catalog/${encodeURIComponent(name)}`);

export const agentCreate = (input: AgentInput) =>
  post<{ id: string }>('/api/agents/catalog', input);

export const agentUpdate = (name: string, input: AgentInput) =>
  put<void>(
    `/api/agents/catalog/${encodeURIComponent(name)}`,
    input,
  );

export const agentDelete = (name: string) =>
  del<void>(`/api/agents/catalog/${encodeURIComponent(name)}`);

/* ── Billing ── */

export const billingUsage = (p: {
  org_id: string;
  from?: string;
  to?: string;
}) => get<UsageResponse>(`/api/billing/usage${qs(p)}`);

export const billingInvoices = (org_id: string) =>
  get<Invoice[]>(`/api/billing/invoices${qs({ org_id })}`);

export const billingRates = (org_id: string) =>
  get<RateCard[]>(`/api/billing/rates${qs({ org_id })}`);

export const billingAlert = (input: AlertRequest) =>
  post<unknown>('/api/billing/alerts', input);

/* ── Inference ── */

export const inferenceCosts = (p?: {
  agent_id?: string;
  org_id?: string;
  plan_id?: string;
}) => get<CostSummary[]>(`/api/inference/costs${qs(p ?? {})}`);

export const inferenceRouting = (p?: {
  prompt?: string;
  tier?: string;
  agent_id?: string;
  max_cost?: number;
}) =>
  get<RoutingResponse>(
    `/api/inference/routing-decision${qs(p ?? {})}`,
  );

/* ── Observatory ── */

export const observatoryTimeline = (p?: {
  org_id?: string;
  source?: string;
  event_type?: string;
  node_id?: string;
  since?: string;
  until?: string;
  limit?: number;
}) => get<TimelineEvent[]>(`/api/observatory/timeline${qs(p ?? {})}`);

export const observatorySearch = (q: string, limit?: number) =>
  get<SearchResult[]>(`/api/observatory/search${qs({ q, limit })}`);

export const observatoryDashboard = (p?: {
  org_id?: string;
  since?: string;
  until?: string;
}) =>
  get<ObservatoryDashboard>(
    `/api/observatory/dashboard${qs(p ?? {})}`,
  );

export const observatoryAnomalies = (p?: {
  kind?: string;
  include_resolved?: boolean;
  limit?: number;
}) => get<Anomaly[]>(`/api/observatory/anomalies${qs(p ?? {})}`);

export const observatoryResolve = (id: string) =>
  post<{ ok: boolean }>(
    `/api/observatory/anomalies/${encodeURIComponent(id)}/resolve`,
  );

/* ── Prompts & Skills ── */

export const promptList = (p?: { active?: boolean; limit?: number }) =>
  get<Prompt[]>(`/api/prompts${qs(p ?? {})}`);

export const promptGet = (id: string) =>
  get<Prompt>(`/api/prompts/${encodeURIComponent(id)}`);

export const promptCreate = (input: PromptInput) =>
  post<{ id: string }>('/api/prompts', input);

export const promptDelete = (id: string) =>
  del<void>(`/api/prompts/${encodeURIComponent(id)}`);

export const skillList = () => get<Skill[]>('/api/skills');

export const skillSearch = (q?: string, category?: string) =>
  get<Skill[]>(`/api/skills/search${qs({ q, category })}`);

export const skillCreate = (input: SkillInput) =>
  post<{ id: string }>('/api/skills', input);

/* ── Organizations ── */

export const orgList = () => get<Org[]>('/api/orgs');

export const orgGet = (id: string) =>
  get<Org>(`/api/orgs/${encodeURIComponent(id)}`);

export const orgCreate = (input: OrgInput) =>
  post<{ id: string }>('/api/orgs', input);

export const orgUpdate = (id: string, input: OrgInput) =>
  put<void>(`/api/orgs/${encodeURIComponent(id)}`, input);

export const orgDelete = (id: string) =>
  del<void>(`/api/orgs/${encodeURIComponent(id)}`);

export const orgDelegations = (org_id: string) =>
  get<OrgDelegation[]>(`/api/orgs/${encodeURIComponent(org_id)}/delegations`);

/* ── Plans & Tasks ── */

export const planList = (p?: { org_id?: string; status?: string }) =>
  get<Plan[]>(`/api/plans${qs(p ?? {})}`);

export const planGet = (id: string) =>
  get<Plan>(`/api/plans/${encodeURIComponent(id)}`);

export const planCreate = (input: PlanInput) =>
  post<{ id: string }>('/api/plans', input);

export const planWaves = (plan_id: string) =>
  get<Wave[]>(`/api/plans/${encodeURIComponent(plan_id)}/waves`);

/* ── Mesh ── */

export const meshNodes = () => get<MeshNode[]>('/api/mesh/nodes');

export const meshNodeGet = (id: string) =>
  get<MeshNode>(`/api/mesh/nodes/${encodeURIComponent(id)}`);

/* ── Multitenancy ── */

export const tenancyPeers = (org_id: string) =>
  get<PeerEntry[]>(`/api/tenancy/peers${qs({ org_id })}`);

export const tenancyAudit = (p?: {
  org_id?: string;
  limit?: number;
}) => get<AuditEntry[]>(`/api/tenancy/audit${qs(p ?? {})}`);

export const tenancyResources = (org_id: string) =>
  get<ResourceStatus>(`/api/tenancy/resources${qs({ org_id })}`);

/* ── Extensions ── */

export const extensionList = () =>
  get<ExtensionInfo[]>('/api/extensions');

export const extensionGet = (id: string) =>
  get<ExtensionInfo>(`/api/extensions/${encodeURIComponent(id)}`);

/* ── Dependency Graph ── */

export const depgraph = () => get<DepGraph>('/api/depgraph');
export const depgraphValidate = () =>
  get<DepGraphValidation>('/api/depgraph/validate');

/* ── Backup ── */

export const backupSnapshots = () =>
  get<Snapshot[]>('/api/backup/snapshots');

export const backupCreate = (label?: string) =>
  post<Snapshot>('/api/backup/snapshots/create', { label });
