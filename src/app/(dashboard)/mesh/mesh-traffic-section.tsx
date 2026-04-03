"use client";

import { useApiQuery } from "@/hooks";
import { meshApi } from "@/lib/api";
import type { MeshTraffic } from "@/lib/api";
import { MnDataTable } from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";
import { formatNumber } from "@/components/maranello/mn-format";

interface MeshTrafficSectionProps {
  initialTraffic: MeshTraffic | null;
}

type HeartbeatRow = Record<string, unknown> & {
  peer: string;
  lastSeen: string;
};

type SyncPeerRow = Record<string, unknown> & {
  peer: string;
  active: string;
  lastSync: string;
  latencyMs: string;
  totalSent: string;
  totalReceived: string;
  totalApplied: string;
};

const heartbeatColumns: DataTableColumn<HeartbeatRow>[] = [
  { key: "peer", label: "Peer", sortable: true },
  { key: "lastSeen", label: "Last Seen", sortable: true, align: "right" },
];

const syncPeerColumns: DataTableColumn<SyncPeerRow>[] = [
  { key: "peer", label: "Peer", sortable: true },
  { key: "active", label: "Active", sortable: true },
  { key: "lastSync", label: "Last Sync", sortable: true, align: "right" },
  { key: "latencyMs", label: "Latency (ms)", sortable: true, align: "right" },
  { key: "totalSent", label: "Sent", sortable: true, align: "right" },
  { key: "totalReceived", label: "Received", sortable: true, align: "right" },
  { key: "totalApplied", label: "Applied", sortable: true, align: "right" },
];

function formatSecondsAgo(s: number): string {
  if (s < 60) return `${Math.round(s)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}

export function MeshTrafficSection({ initialTraffic }: MeshTrafficSectionProps) {
  const { data } = useApiQuery(
    () => meshApi.getMeshTraffic(),
    { pollInterval: 15000 },
  );

  const traffic = data ?? initialTraffic;
  if (!traffic) return null;

  const heartbeatRows: HeartbeatRow[] = (traffic.heartbeats ?? []).map((h) => ({
    peer: h.peer,
    lastSeen: formatSecondsAgo(h.last_seen_ago_s ?? 0),
  }));

  const syncPeerRows: SyncPeerRow[] = (traffic.sync_peers ?? []).map((sp) => ({
    peer: sp.peer,
    active: sp.active ? "Yes" : "No",
    lastSync: formatSecondsAgo(sp.last_sync_ago_s ?? 0),
    latencyMs: formatNumber(sp.latency_ms ?? 0),
    totalSent: formatNumber(sp.total_sent ?? 0),
    totalReceived: formatNumber(sp.total_received ?? 0),
    totalApplied: formatNumber(sp.total_applied ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Heartbeats{traffic.local_node ? ` (${traffic.local_node})` : ""}
        </h2>
        <MnDataTable
          columns={heartbeatColumns}
          data={heartbeatRows}
          compact
          emptyMessage="No heartbeat data"
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Sync Peers
        </h2>
        <MnDataTable
          columns={syncPeerColumns}
          data={syncPeerRows}
          compact
          emptyMessage="No sync peer data"
        />
      </div>
    </div>
  );
}
