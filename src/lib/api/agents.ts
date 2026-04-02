import { api } from "./client";
import type {
  AgentSummary,
  AgentCatalogEntry,
  AgentSession,
  AgentTree,
  TriageRequest,
  TriageResult,
} from "./types";

export async function listAgents(): Promise<AgentSummary[]> {
  return api.get<AgentSummary[]>("/api/agents");
}

export async function getAgentCatalog(): Promise<AgentCatalogEntry[]> {
  return api.get<AgentCatalogEntry[]>("/api/agents/catalog");
}

export async function getActiveSessions(): Promise<AgentSession[]> {
  return api.get<AgentSession[]>("/api/ipc/agents/list");
}

export async function getAgentTree(): Promise<AgentTree> {
  return api.get<AgentTree>("/api/ipc/agents/tree");
}

export async function triageAgent(req: TriageRequest): Promise<TriageResult> {
  return api.post<TriageResult>("/api/agents/triage", req);
}
