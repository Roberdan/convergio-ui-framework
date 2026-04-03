import { securityApi } from "@/lib/api";
import { SecurityClient } from "./security-client";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  let policy = null;
  let queue = null;
  let auditLog = null;

  try {
    [policy, queue, auditLog] = await Promise.all([
      securityApi.getPolicyStatus(),
      securityApi.getValidationQueue(),
      securityApi.getAuditLog(),
    ]);
  } catch {
    // Daemon offline — client will poll
  }

  return (
    <SecurityClient
      initialPolicy={policy}
      initialQueue={queue}
      initialAudit={auditLog}
    />
  );
}

