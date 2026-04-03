import { api } from "./client";
import type { OverviewStats, BrainData, TokenUsage, TaskDistribution, ModelTokenUsage } from "./types";

export async function getOverview(): Promise<OverviewStats> {
  return api.get<OverviewStats>("/api/overview");
}

export async function getBrainData(): Promise<BrainData> {
  return api.get<BrainData>("/api/brain");
}

export async function getTokenUsageDaily(): Promise<TokenUsage[]> {
  return api.get<TokenUsage[]>("/api/tokens/daily");
}

export async function getTaskDistribution(): Promise<TaskDistribution[]> {
  return api.get<TaskDistribution[]>("/api/tasks/distribution");
}

export async function getTokenUsageByModel(): Promise<ModelTokenUsage[]> {
  return api.get<ModelTokenUsage[]>("/api/tokens/models");
}
