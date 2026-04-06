/**
 * API client for Night Agents endpoints (/api/night-agents/*).
 * Separated from api.ts to respect 250-line limit.
 */

import type {
  NightAgentDef,
  NightAgentRun,
  TrackedProject,
} from './types-night-agents';

const BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8420')
    : (process.env.API_URL ?? 'http://localhost:8420');

const AUTH_TOKEN =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_AUTH_TOKEN ?? '')
    : (process.env.AUTH_TOKEN ?? '');

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
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
    throw new Error(`API ${res.status}: ${text.slice(0, 100)}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const nightAgentList = () =>
  request<NightAgentDef[]>('GET', '/api/night-agents');

export const nightAgentActiveRuns = () =>
  request<NightAgentRun[]>('GET', '/api/night-agents/runs/active');

export const nightAgentProjects = () =>
  request<TrackedProject[]>('GET', '/api/night-agents/projects');

export const nightAgentTrigger = (id: number) =>
  request<{ status: string }>('POST', `/api/night-agents/${id}/trigger`);
