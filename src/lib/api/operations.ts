import { api } from "./client";
import type {
  NightlyJob,
  ExecutionRun,
  AuditLogEntry,
  Notification,
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
