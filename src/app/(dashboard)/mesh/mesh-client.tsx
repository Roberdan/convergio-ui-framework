"use client";

import { useApiQuery } from "@/hooks";
import { meshApi } from "@/lib/api";
import type { MeshTopology, MeshMetrics, HeartbeatStatus, PeerInfo } from "@/lib/api";
import {
  MnMeshNetwork,
  MnDashboardStrip,
  MnGauge,
  MnDeploymentTable,
  MnSpinner,
} from "@/components/maranello";
import type { StripMetric } from "@/components/maranello";

interface MeshClientProps {
  initialTopology: MeshTopology | null;
  initialMetrics: MeshMetrics | null;
  initialHeartbeats: HeartbeatStatus[] | null;
  initialPeers: PeerInfo[] | null;
}

export function MeshClient({
  initialTopology,
  initialMetrics,
  initialHeartbeats,
  initialPeers,
}: MeshClientProps) {
  const { data: topology } = useApiQuery(
    () => meshApi.getMeshTopology(),
    { pollInterval: 15000 },
  );
  const { data: metrics } = useApiQuery(
    () => meshApi.getMeshMetrics(),
    { pollInterval: 15000 },
  );
  const { data: peers } = useApiQuery(
    () => meshApi.listPeers(),
    { pollInterval: 30000 },
  );

  const topo = topology ?? initialTopology;
  const meshMetrics = metrics ?? initialMetrics;
  const peerList = peers ?? initialPeers;

  if (!topo && !meshMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Connecting to mesh..." />
      </div>
    );
  }

  const stripMetrics: StripMetric[] = meshMetrics
    ? [
        { label: "Total Nodes", value: meshMetrics.totalNodes },
        { label: "Online", value: meshMetrics.onlineNodes, trend: "up" },
        { label: "Avg Latency", value: `${meshMetrics.avgLatency}ms`, unit: "ms" },
        { label: "Msg Rate", value: `${meshMetrics.messageRate}/s` },
      ]
    : [];

  const deployments = (peerList ?? []).map((p) => ({
    node: p.id,
    version: p.version,
    status: p.status === "connected" ? "deployed" as const : "failed" as const,
    timestamp: p.connectedAt,
    hash: p.address,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1>Mesh</h1>
        <p className="text-caption mt-1">Distributed system topology and health</p>
      </div>

      {stripMetrics.length > 0 && (
        <MnDashboardStrip metrics={stripMetrics} ariaLabel="Mesh metrics" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topo && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
              Network Topology
            </h2>
            <MnMeshNetwork
              nodes={topo.nodes}
              edges={topo.edges}
              ariaLabel="Mesh network topology"
            />
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Node Health
          </h2>
          {meshMetrics ? (
            <MnGauge
              value={meshMetrics.onlineNodes}
              max={meshMetrics.totalNodes}
              label="Online Nodes"
              animate
              size="md"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No metrics available</p>
          )}
        </div>
      </div>

      {deployments.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Peer Nodes
          </h2>
          <MnDeploymentTable deployments={deployments} ariaLabel="Peer deployments" />
        </div>
      )}
    </div>
  );
}
