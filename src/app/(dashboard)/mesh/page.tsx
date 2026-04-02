import { meshApi } from "@/lib/api";
import { MeshClient } from "./mesh-client";

export const dynamic = 'force-dynamic';

export default async function MeshPage() {
  let topology = null;
  let metrics = null;
  let heartbeats = null;
  let peers = null;

  try {
    [topology, metrics, heartbeats, peers] = await Promise.all([
      meshApi.getMeshTopology(),
      meshApi.getMeshMetrics(),
      meshApi.getHeartbeatStatus(),
      meshApi.listPeers(),
    ]);
  } catch {
    // Daemon offline
  }

  return (
    <MeshClient
      initialTopology={topology}
      initialMetrics={metrics}
      initialHeartbeats={heartbeats}
      initialPeers={peers}
    />
  );
}
