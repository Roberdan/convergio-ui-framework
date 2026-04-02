import { api } from "./client";
import type {
  PlanSummary,
  PlanDetail,
  ExecutionTree,
  CreatePlanRequest,
} from "./types";

export async function listPlans(): Promise<PlanSummary[]> {
  return api.get<PlanSummary[]>("/api/plan-db/list");
}

export async function getPlanContext(id: string): Promise<PlanDetail> {
  return api.get<PlanDetail>(`/api/plan-db/context/${id}`);
}

export async function getExecutionTree(id: string): Promise<ExecutionTree> {
  return api.get<ExecutionTree>(`/api/plan-db/execution-tree/${id}`);
}

export async function createPlan(data: CreatePlanRequest): Promise<PlanSummary> {
  return api.post<PlanSummary>("/api/plan-db/create", data);
}

export async function startPlan(id: string): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(`/api/plan-db/start/${id}`);
}
