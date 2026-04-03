import { operationsApi } from "@/lib/api";
import { OperationsClient } from "./operations-client";

export const dynamic = 'force-dynamic';

export default async function OperationsPage() {
  let jobs = null;
  let runs = null;
  let audit = null;
  let notifications = null;
  let workers = null;
  let workersStatus = null;
  let snapshots = null;

  try {
    [jobs, runs, audit, notifications, workers, workersStatus, snapshots] =
      await Promise.all([
        operationsApi.getNightlyJobs(),
        operationsApi.getExecutionRuns(),
        operationsApi.getAuditLog(),
        operationsApi.getNotifications(),
        operationsApi.getWorkers(),
        operationsApi.getWorkersStatus(),
        operationsApi.getRollbackSnapshots(),
      ]);
  } catch {
    // Daemon offline
  }

  return (
    <OperationsClient
      initialJobs={jobs}
      initialRuns={runs}
      initialAudit={audit}
      initialNotifications={notifications}
      initialWorkers={workers}
      initialWorkersStatus={workersStatus}
      initialSnapshots={snapshots}
    />
  );
}
