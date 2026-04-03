import { meshApi } from "@/lib/api";
import { MeshClient } from "./mesh-client";

export const dynamic = 'force-dynamic';

export default async function MeshPage() {
  let topology = null;
  let metrics = null;
  let peers = null;
  let syncStatus = null;
  let diagnostics = null;
  let traffic = null;

  try {
    [topology, metrics, peers, syncStatus, diagnostics, traffic] =
      await Promise.all([
        meshApi.getMeshTopology(),
        meshApi.getMeshMetrics(),
        meshApi.listPeers(),
        meshApi.getMeshSyncStatus(),
        meshApi.getMeshDiagnostics(),
        meshApi.getMeshTraffic(),
      ]);
  } catch {
    // Daemon offline
  }

  return (
    <MeshClient
      initialTopology={topology}
      initialMetrics={metrics}
      initialPeers={peers}
      initialSyncStatus={syncStatus}
      initialDiagnostics={diagnostics}
      initialTraffic={traffic}
    />
  );
}
