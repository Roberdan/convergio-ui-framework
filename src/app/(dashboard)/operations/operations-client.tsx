"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks";
import { operationsApi } from "@/lib/api";
import type {
  NightlyJob,
  ExecutionRun,
  AuditLogEntry,
  Notification,
  Worker,
  WorkersStatus,
  RollbackSnapshot,
} from "@/lib/api";
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
  MnDashboardStrip,
} from "@/components/maranello";
import type { StripMetric } from "@/components/maranello";
import { WorkersTab } from "./workers-tab";
import { RunDetailPanel } from "./run-detail-panel";
import { RollbackTab } from "./rollback-tab";

interface OperationsClientProps {
  initialJobs: NightlyJob[] | null;
  initialRuns: ExecutionRun[] | null;
  initialAudit: AuditLogEntry[] | null;
  initialNotifications: Notification[] | null;
  initialWorkers: Worker[] | null;
  initialWorkersStatus: WorkersStatus | null;
  initialSnapshots: RollbackSnapshot[] | null;
}

export function OperationsClient({
  initialJobs,
  initialRuns,
  initialAudit,
  initialNotifications,
  initialWorkers,
  initialWorkersStatus,
  initialSnapshots,
}: OperationsClientProps) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
  const { data: wStatus } = useApiQuery(
    () => operationsApi.getWorkersStatus(),
    { pollInterval: 15000 },
  );

  const jobList = jobs ?? initialJobs;
  const runList = runs ?? initialRuns;
  const auditList = audit ?? initialAudit;
  const notifList = initialNotifications;
  const workerStatus = wStatus ?? initialWorkersStatus;

  if (!jobList && !runList) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading operations..." />
      </div>
    );
  }

  const activeRuns = (runList ?? []).filter((r) => r.status === "running").length;
  const failedJobs = (jobList ?? []).filter((j) => j.status === "failed").length;

  const stripMetrics: StripMetric[] = [
    { label: "Active Runs", value: activeRuns, trend: activeRuns > 0 ? "up" : "flat" },
    { label: "Failed Jobs", value: failedJobs, trend: failedJobs > 0 ? "down" : "flat" },
    { label: "Workers", value: workerStatus?.total ?? 0 },
    { label: "Workers Active", value: workerStatus?.active ?? 0, trend: "up" },
  ];

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

      <MnDashboardStrip metrics={stripMetrics} ariaLabel="Operations metrics" />

      <MnTabs defaultValue="runs">
        <MnTabList>
          <MnTab value="runs">Active Runs ({missions.length})</MnTab>
          <MnTab value="workers">Workers ({workerStatus?.total ?? 0})</MnTab>
          <MnTab value="jobs">Nightly Jobs ({jobList?.length ?? 0})</MnTab>
          <MnTab value="rollback">Rollback</MnTab>
          <MnTab value="audit">Audit Log</MnTab>
          <MnTab value="log">Binnacle</MnTab>
        </MnTabList>

        <MnTabPanel value="runs">
          <div className="rounded-lg border border-border bg-card p-4 mt-4">
            <MnActiveMissions
              missions={missions}
              ariaLabel="Active execution runs"
            />
            {missions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(runList ?? []).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-md border border-border bg-muted hover:bg-accent transition-colors"
                    onClick={() => { setSelectedRunId(r.id); setDetailOpen(true); }}
                  >
                    Details: {r.id.slice(0, 8)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </MnTabPanel>

        <MnTabPanel value="workers">
          <WorkersTab initial={initialWorkers} />
        </MnTabPanel>

        <MnTabPanel value="jobs">
          <div className="rounded-lg border border-border bg-card p-4 mt-4">
            <MnNightJobs jobs={jobList ?? []} ariaLabel="Nightly jobs" />
          </div>
        </MnTabPanel>

        <MnTabPanel value="rollback">
          <RollbackTab initial={initialSnapshots} />
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

      <RunDetailPanel
        runId={selectedRunId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
