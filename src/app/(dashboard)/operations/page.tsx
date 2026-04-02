import { operationsApi } from "@/lib/api";
import { OperationsClient } from "./operations-client";

export const dynamic = 'force-dynamic';

export default async function OperationsPage() {
  let jobs = null;
  let runs = null;
  let audit = null;
  let notifications = null;

  try {
    [jobs, runs, audit, notifications] = await Promise.all([
      operationsApi.getNightlyJobs(),
      operationsApi.getExecutionRuns(),
      operationsApi.getAuditLog(),
      operationsApi.getNotifications(),
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
    />
  );
}
