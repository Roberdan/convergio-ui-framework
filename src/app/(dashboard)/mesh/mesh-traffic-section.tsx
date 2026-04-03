"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks";
import { meshApi } from "@/lib/api";
import type { MeshTraffic, MeshTopology } from "@/lib/api";
import { MnHeatmap, MnDataTable } from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";

interface MeshTrafficSectionProps {
  initialTraffic: MeshTraffic | null;
  topology: MeshTopology | null;
}

type TrafficRow = Record<string, unknown> & {
  nodeId: string;
  label: string;
  bytesIn: string;
  bytesOut: string;
  latencyMs: number;
  connections: number;
};

const trafficColumns: DataTableColumn<TrafficRow>[] = [
  { key: "label", label: "Node", sortable: true },
  { key: "bytesIn", label: "In", sortable: true, align: "right" },
  { key: "bytesOut", label: "Out", sortable: true, align: "right" },
  { key: "latencyMs", label: "Latency (ms)", sortable: true, align: "right" },
  { key: "connections", label: "Conns", sortable: true, align: "right" },
];

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function MeshTrafficSection({ initialTraffic, topology }: MeshTrafficSectionProps) {
  const { data } = useApiQuery(
    () => meshApi.getMeshTraffic(),
    { pollInterval: 15000 },
  );

  const traffic = data ?? initialTraffic;

  const heatmapData = useMemo(() => {
    if (!traffic?.nodeTraffic?.length || !topology?.nodes?.length) return null;
    const nodes = topology.nodes;
    const trafficMap = new Map(traffic.nodeTraffic.map((n) => [n.nodeId, n]));

    return nodes.map((row) => {
      return nodes.map((col) => {
        if (row.id === col.id) return { label: "—", value: 0 };
        const edge = topology.edges.find(
          (e) => (e.from === row.id && e.to === col.id) ||
                 (e.from === col.id && e.to === row.id),
        );
        const latency = edge?.latency ?? 0;
        const nodeTraffic = trafficMap.get(row.id);
        return {
          label: `${row.label}→${col.label}: ${latency}ms`,
          value: nodeTraffic ? latency : 0,
        };
      });
    });
  }, [traffic, topology]);

  if (!traffic) return null;

  const rows: TrafficRow[] = traffic.nodeTraffic.map((n) => ({
    nodeId: n.nodeId,
    label: n.label,
    bytesIn: formatBytes(n.bytesIn),
    bytesOut: formatBytes(n.bytesOut),
    latencyMs: n.latencyMs,
    connections: n.connections,
  }));

  return (
    <div className="space-y-6">
      {heatmapData && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Latency Heatmap
          </h2>
          <MnHeatmap
            data={heatmapData}
            showValues
            ariaLabel="Node-to-node latency heatmap"
          />
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Node Traffic
        </h2>
        <MnDataTable
          columns={trafficColumns}
          data={rows}
          compact
          emptyMessage="No traffic data"
        />
      </div>
    </div>
  );
}
