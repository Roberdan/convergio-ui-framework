/**
 * Extended API functions for plan-db and mesh endpoints.
 * Kept separate to avoid exceeding the 250-line file limit on api.ts.
 */

import type { PlanDb, ExecutionTree, MeshPeer, MeshStatus } from './types';

const BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8420')
    : (process.env.API_URL ?? 'http://localhost:8420');

const AUTH_TOKEN =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_AUTH_TOKEN ?? '')
    : (process.env.AUTH_TOKEN ?? '');

async function get<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(`${BASE}${path}`, { method: 'GET', headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text.slice(0, 120)}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text.slice(0, 120)}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | undefined>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries as [string, string][]).toString();
}

/* ── Plan DB ── */

export const planDbList = (p?: { status?: string; project_id?: string }) =>
  get<PlanDb[]>(`/api/plan-db/list${qs(p ?? {})}`);

export const planDbExecutionTree = (id: number) =>
  get<ExecutionTree>(`/api/plan-db/execution-tree/${id}`);

export const planDbCreate = (name: string, project_id = 'default') =>
  post<{ id: number }>('/api/plan-db/create', { name, project_id });

/* ── Mesh ── */

export const meshPeers = () => get<MeshPeer[]>('/api/mesh/peers');

export const meshStatus = () => get<MeshStatus>('/api/mesh');
