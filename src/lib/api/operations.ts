import { api } from "./client";
import type {
  NightlyJob,
  ExecutionRun,
  AuditLogEntry,
  Notification,
  Worker,
  WorkersStatus,
  RollbackSnapshot,
  RunDetail,
} from "./types";

export async function getNightlyJobs(): Promise<NightlyJob[]> {
  return api.get<NightlyJob[]>("/api/nightly/jobs");
}

export async function getExecutionRuns(): Promise<ExecutionRun[]> {
  return api.get<ExecutionRun[]>("/api/runs");
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return api.get<AuditLogEntry[]>("/api/audit/log");
}

export async function getNotifications(): Promise<Notification[]> {
  return api.get<Notification[]>("/api/notifications");
}

export async function getWorkers(): Promise<Worker[]> {
  return api.get<Worker[]>("/api/workers");
}

export async function getWorkersStatus(): Promise<WorkersStatus> {
  return api.get<WorkersStatus>("/api/workers/status");
}

export async function getRollbackSnapshots(): Promise<RollbackSnapshot[]> {
  return api.get<RollbackSnapshot[]>("/api/rollback/snapshots");
}

export async function getRun(id: string): Promise<RunDetail> {
  return api.get<RunDetail>(`/api/runs/${id}`);
}
