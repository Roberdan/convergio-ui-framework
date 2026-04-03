import { api } from "./client";
import type {
  AgentSummary,
  AgentCatalogEntry,
  AgentSession,
  AgentTree,
  AgentHistoryEntry,
  TriageRequest,
  TriageResult,
} from "./types";

interface AgentsResponse {
  recent?: AgentSummary[];
  running?: AgentSummary[];
  stats?: Record<string, unknown>;
}

export async function listAgents(): Promise<AgentSummary[]> {
  const data = await api.get<AgentsResponse>("/api/agents");
  const running = Array.isArray(data?.running) ? data.running : [];
  const recent = Array.isArray(data?.recent) ? data.recent : [];
  // Merge running + recent, deduplicate by id
  const seen = new Set<string>();
  const merged: AgentSummary[] = [];
  for (const a of [...running, ...recent]) {
    const raw = a as unknown as Record<string, unknown>;
    const id = (raw.agent_id as string) ?? a.id;
    if (!seen.has(id)) {
      seen.add(id);
      merged.push({
        id,
        name: a.name ?? id,
        type: a.type ?? 'unknown',
        status: (raw.status as AgentSummary['status']) ?? 'idle',
        model: a.model ?? 'unknown',
        taskCount: a.taskCount ?? 0,
      });
    }
  }
  return merged;
}

export async function getAgentCatalog(): Promise<AgentCatalogEntry[]> {
  const data = await api.get<{ agents?: AgentCatalogEntry[]; ok?: boolean } | AgentCatalogEntry[]>(
    "/api/agents/catalog",
  );
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.agents) ? data.agents : [];
}

export async function getActiveSessions(): Promise<AgentSession[]> {
  return api.get<AgentSession[]>("/api/ipc/agents/list");
}

export async function getAgentTree(): Promise<AgentTree> {
  return api.get<AgentTree>("/api/ipc/agents/tree");
}

export async function getAgentHistory(): Promise<AgentHistoryEntry[]> {
  const data = await api.get<AgentHistoryEntry[] | Record<string, unknown>>("/api/agents/history");
  if (Array.isArray(data)) return data;
  const entries = (data as Record<string, unknown>).entries;
  return Array.isArray(entries) ? entries as AgentHistoryEntry[] : [];
}

export async function triageAgent(req: TriageRequest): Promise<TriageResult> {
  return api.post<TriageResult>("/api/agents/triage", req);
}
