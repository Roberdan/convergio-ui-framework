import { api } from "./client";
import type {
  PolicyStatus,
  ValidationItem,
  ValidationVerdict,
  SecurityAuditEntry,
  ProjectAuditTrail,
} from "./types-security";

export async function getPolicyStatus(): Promise<PolicyStatus> {
  return api.get<PolicyStatus>("/api/policy/status");
}

export async function getValidationQueue(): Promise<ValidationItem[]> {
  return api.get<ValidationItem[]>("/api/validation/queue");
}

export async function getValidationVerdict(
  taskId: string,
): Promise<ValidationVerdict> {
  return api.get<ValidationVerdict>(`/api/validation/verdict/${taskId}`);
}

export async function getAuditLog(): Promise<SecurityAuditEntry[]> {
  return api.get<SecurityAuditEntry[]>("/api/audit/log");
}

export async function getProjectAudit(
  projectId: string,
): Promise<ProjectAuditTrail> {
  return api.get<ProjectAuditTrail>(`/api/audit/project/${projectId}`);
}
