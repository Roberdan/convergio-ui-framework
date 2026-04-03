// Security-related API types

/* ── Policy ── */

export interface PolicyEntry {
  [key: string]: unknown;
}

export interface PolicyStatus {
  policies: PolicyEntry[];
  ok: boolean;
}

/* ── Validation ── */

export interface ValidationItem {
  taskId: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "review";
  severity: "critical" | "high" | "medium" | "low";
  submittedAt: string;
  submittedBy: string;
  detail?: string;
}

export interface ValidationVerdict {
  taskId: string;
  verdict: "approved" | "rejected" | "escalated";
  reason: string;
  reviewedBy: string;
  reviewedAt: string;
}

/* ── Audit ── */

export interface SecurityAuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
  severity?: "info" | "warning" | "critical";
}

export interface ProjectAuditTrail {
  projectId: string;
  entries: SecurityAuditEntry[];
}

/* ── Aggregated page data ── */

export interface SecurityPageData {
  policy: PolicyStatus | null;
  validationQueue: ValidationItem[] | null;
  auditLog: SecurityAuditEntry[] | null;
}
