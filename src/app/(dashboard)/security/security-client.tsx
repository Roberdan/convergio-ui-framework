"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks";
import { securityApi } from "@/lib/api";
import type {
  PolicyStatus,
  ValidationItem,
  SecurityAuditEntry,
} from "@/lib/api";
import {
  MnDashboardStrip,
  MnTabs,
  MnTabList,
  MnTab,
  MnTabPanel,
  MnDataTable,
  MnBadge,
  MnAuditLog,
  MnSpinner,
} from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";
import type { StripMetric } from "@/components/maranello/mn-dashboard-strip";
import { Shield } from "lucide-react";

interface SecurityClientProps {
  initialPolicy: PolicyStatus | null;
  initialQueue: ValidationItem[] | null;
  initialAudit: SecurityAuditEntry[] | null;
}

type QueueRow = Record<string, unknown> & {
  taskId: string;
  title: string;
  status: string;
  severity: string;
  submittedBy: string;
  submittedAt: string;
};

const severityTone: Record<string, "danger" | "warning" | "info" | "neutral"> =
  { critical: "danger", high: "warning", medium: "info", low: "neutral" };

const statusTone: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> =
  { approved: "success", rejected: "danger", pending: "info", review: "warning" };

const queueColumns: DataTableColumn<QueueRow>[] = [
  { key: "title", label: "Task", sortable: true },
  {
    key: "severity",
    label: "Severity",
    sortable: true,
    render: (v) => (
      <MnBadge label={String(v)} tone={severityTone[String(v)] ?? "neutral"} />
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (v) => (
      <MnBadge label={String(v)} tone={statusTone[String(v)] ?? "neutral"} />
    ),
  },
  { key: "submittedBy", label: "Submitted By", sortable: true },
  { key: "submittedAt", label: "Submitted", sortable: true },
];

export function SecurityClient({
  initialPolicy,
  initialQueue,
  initialAudit,
}: SecurityClientProps) {
  const [tab, setTab] = useState("overview");

  const { data: policy } = useApiQuery(
    () => securityApi.getPolicyStatus(),
    { pollInterval: 30_000 },
  );
  const { data: queue } = useApiQuery(
    () => securityApi.getValidationQueue(),
    { pollInterval: 15_000 },
  );
  const { data: audit } = useApiQuery(
    () => securityApi.getAuditLog(),
    { pollInterval: 30_000 },
  );

  const p = policy ?? initialPolicy;
  const q = Array.isArray(queue) ? queue : Array.isArray(initialQueue) ? initialQueue : null;
  const a = Array.isArray(audit) ? audit : Array.isArray(initialAudit) ? initialAudit : null;

  if (!p && !q && !a) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Connecting to daemon..." />
      </div>
    );
  }

  const policyCount = p?.policies?.length ?? 0;

  const metrics: StripMetric[] = [
    { label: "Policies", value: String(policyCount) },
    { label: "Status", value: p?.ok ? "OK" : "—" },
    { label: "Pending Validations", value: String(q?.filter((v) => v.status === "pending").length ?? 0) },
    { label: "Audit Entries", value: String(a?.length ?? 0) },
  ];

  const rows: QueueRow[] = (q ?? []).map((v) => ({
    taskId: v.taskId,
    title: v.title,
    status: v.status,
    severity: v.severity,
    submittedBy: v.submittedBy,
    submittedAt: new Date(v.submittedAt).toLocaleDateString(),
  }));

  const auditEntries = (a ?? []).map((e) => ({
    timestamp: e.timestamp,
    actor: e.actor,
    action: e.action,
    target: e.target,
    detail: e.detail,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1>Security</h1>
          <p className="text-caption mt-1">
            Platform security policies and audit status.
          </p>
        </div>
      </div>

      <MnDashboardStrip metrics={metrics} ariaLabel="Security metrics" />

      <MnTabs value={tab} onValueChange={setTab}>
        <MnTabList>
          <MnTab value="overview">Overview</MnTab>
          <MnTab value="validation">Validation Queue</MnTab>
          <MnTab value="audit">Audit Log</MnTab>
        </MnTabList>

        <MnTabPanel value="overview">
          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3">Policies</h3>
            {policyCount > 0 ? (
              <pre className="text-xs text-muted-foreground overflow-auto max-h-64">
                {JSON.stringify(p?.policies, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                No policies configured.
              </p>
            )}
          </div>
        </MnTabPanel>

        <MnTabPanel value="validation">
          <div className="rounded-lg border border-border bg-card p-4 mt-4">
            <MnDataTable
              columns={queueColumns}
              data={rows}
              pageSize={10}
              emptyMessage="No pending validations."
            />
          </div>
        </MnTabPanel>

        <MnTabPanel value="audit">
          <div className="mt-4">
            <MnAuditLog entries={auditEntries} ariaLabel="Security audit log" />
          </div>
        </MnTabPanel>
      </MnTabs>
    </div>
  );
}
