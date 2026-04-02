"use client";

import { useApiQuery } from "@/hooks";
import { operationsApi } from "@/lib/api";
import type { NightlyJob, ExecutionRun, AuditLogEntry, Notification } from "@/lib/api";
import {
  MnNightJobs,
  MnActiveMissions,
  MnAuditLog,
  MnBinnacle,
  MnSpinner,
  MnTabs,
  MnTabList,
  MnTab,
  MnTabPanel,
} from "@/components/maranello";

interface OperationsClientProps {
  initialJobs: NightlyJob[] | null;
  initialRuns: ExecutionRun[] | null;
  initialAudit: AuditLogEntry[] | null;
  initialNotifications: Notification[] | null;
}

export function OperationsClient({
  initialJobs,
  initialRuns,
  initialAudit,
  initialNotifications,
}: OperationsClientProps) {
  const { data: jobs } = useApiQuery(
    () => operationsApi.getNightlyJobs(),
    { pollInterval: 30000 },
  );
  const { data: runs } = useApiQuery(
    () => operationsApi.getExecutionRuns(),
    { pollInterval: 10000 },
  );
  const { data: audit } = useApiQuery(
    () => operationsApi.getAuditLog(),
    { pollInterval: 30000 },
  );

  const jobList = jobs ?? initialJobs;
  const runList = runs ?? initialRuns;
  const auditList = audit ?? initialAudit;
  const notifList = initialNotifications;

  if (!jobList && !runList) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading operations..." />
      </div>
    );
  }

  const missions = (runList ?? []).map((r) => ({
    id: r.id,
    name: `Run ${r.id.slice(0, 8)}`,
    progress: r.status === "completed" ? 100 : r.status === "running" ? 50 : 0,
    status: r.status === "running" ? "active" as const
      : r.status === "completed" ? "completed" as const
      : "failed" as const,
    agent: r.planId,
  }));

  const binnacleEntries = (notifList ?? []).map((n) => ({
    timestamp: n.timestamp,
    severity: n.type === "error" ? "error" as const
      : n.type === "warning" ? "warning" as const
      : "info" as const,
    source: "system",
    message: `${n.title}: ${n.message}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1>Operations</h1>
        <p className="text-caption mt-1">System operations and monitoring</p>
      </div>

      <MnTabs defaultValue="runs">
        <MnTabList>
          <MnTab value="runs">Active Runs ({missions.length})</MnTab>
          <MnTab value="jobs">Nightly Jobs ({jobList?.length ?? 0})</MnTab>
          <MnTab value="audit">Audit Log</MnTab>
          <MnTab value="log">Binnacle</MnTab>
        </MnTabList>

        <MnTabPanel value="runs">
          <div className="rounded-lg border border-border bg-card p-4 mt-4">
            <MnActiveMissions
              missions={missions}
              ariaLabel="Active execution runs"
            />
          </div>
        </MnTabPanel>

        <MnTabPanel value="jobs">
          <div className="rounded-lg border border-border bg-card p-4 mt-4">
            <MnNightJobs jobs={jobList ?? []} ariaLabel="Nightly jobs" />
          </div>
        </MnTabPanel>

        <MnTabPanel value="audit">
          <div className="rounded-lg border border-border bg-card p-4 mt-4">
            <MnAuditLog
              entries={auditList ?? []}
              maxVisible={50}
              ariaLabel="Audit log"
            />
          </div>
        </MnTabPanel>

        <MnTabPanel value="log">
          <div className="rounded-lg border border-border bg-card p-4 mt-4">
            <MnBinnacle
              entries={binnacleEntries}
              maxVisible={50}
              ariaLabel="System log"
            />
          </div>
        </MnTabPanel>
      </MnTabs>
    </div>
  );
}
