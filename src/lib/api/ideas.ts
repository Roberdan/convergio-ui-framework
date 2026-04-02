import { api } from "./client";
import type { Idea, CreateIdeaRequest } from "./types";

export async function listIdeas(): Promise<Idea[]> {
  return api.get<Idea[]>("/api/ideas");
}

export async function createIdea(data: CreateIdeaRequest): Promise<Idea> {
  return api.post<Idea>("/api/ideas", data);
}

export async function promoteIdea(id: string): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(`/api/ideas/${id}/promote`);
}
