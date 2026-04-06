/**
 * Typed HTTP client for the night-agents daemon API.
 *
 * Mirrors daemon routes in convergio-night-agents/src/routes.rs.
 * Reuses the shared request helpers from api.ts.
 */

import { ApiError } from '@/hooks/use-api-query';
import type {
  NightAgentDef,
  NightAgentDefInput,
  NightRun,
  TrackedProject,
  TrackedProjectInput,
} from '@/types/night-agents';

const BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8420')
    : (process.env.API_URL ?? 'http://localhost:8420');

const AUTH_TOKEN =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_AUTH_TOKEN ?? '')
    : (process.env.AUTH_TOKEN ?? '');

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
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

/* ── Agent definitions ── */

export const nightAgentList = (p?: { limit?: number; offset?: number }) =>
  get<NightAgentDef[]>(`/api/night-agents${qs(p ?? {})}`);

export const nightAgentGet = (id: number) =>
  get<NightAgentDef>(`/api/night-agents/${id}`);

export const nightAgentCreate = (input: NightAgentDefInput) =>
  post<{ id: number }>('/api/night-agents', input);

export const nightAgentUpdate = (id: number, input: NightAgentDefInput) =>
  put<void>(`/api/night-agents/${id}`, input);

export const nightAgentDelete = (id: number) =>
  del<void>(`/api/night-agents/${id}`);

/* ── Runs ── */

export const nightAgentTrigger = (id: number) =>
  post<{ run_id: number }>(`/api/night-agents/${id}/trigger`);

export const nightRunList = (
  agentId: number,
  p?: { limit?: number; offset?: number },
) => get<NightRun[]>(`/api/night-agents/${agentId}/runs${qs(p ?? {})}`);

export const nightRunsActive = () =>
  get<NightRun[]>('/api/night-agents/runs/active');

export const nightRunCancel = (agentId: number, runId: number) =>
  post<void>(`/api/night-agents/${agentId}/runs/${runId}/cancel`);

/* ── Tracked projects ── */

export const trackedProjectList = (p?: {
  limit?: number;
  offset?: number;
}) => get<TrackedProject[]>(`/api/night-agents/projects${qs(p ?? {})}`);

export const trackedProjectCreate = (input: TrackedProjectInput) =>
  post<{ id: number }>('/api/night-agents/projects', input);

export const trackedProjectDelete = (id: number) =>
  del<void>(`/api/night-agents/projects/${id}`);

export const trackedProjectScan = (id: number) =>
  post<{ ok: boolean }>(`/api/night-agents/projects/${id}/scan`);
