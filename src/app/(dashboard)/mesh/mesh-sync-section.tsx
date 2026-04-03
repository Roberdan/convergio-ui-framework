"use client";

import { useApiQuery } from "@/hooks";
import { meshApi } from "@/lib/api";
import type { MeshSyncStatus } from "@/lib/api";
import { MnSystemStatus, MnDataTable } from "@/components/maranello";
import type { Service, DataTableColumn } from "@/components/maranello";
import { formatNumber } from "@/components/maranello/mn-format";

interface MeshSyncSectionProps {
  initial: MeshSyncStatus | null;
}

type EventRow = Record<string, unknown> & {
  status: string;
  count: string;
};

const eventColumns: DataTableColumn<EventRow>[] = [
  { key: "status", label: "Status", sortable: true },
  { key: "count", label: "Count", sortable: true, align: "right" },
];

export function MeshSyncSection({ initial }: MeshSyncSectionProps) {
  const { data } = useApiQuery(
    () => meshApi.getMeshSyncStatus(),
    { pollInterval: 10000 },
  );

  const sync = data ?? initial;
  if (!sync) return null;

  const latency = sync.latency;

  const services: Service[] = [
    {
      id: "sync-p50",
      name: "DB Sync P50",
      status: (latency?.db_sync_p50_ms ?? 0) < 100 ? "operational"
        : (latency?.db_sync_p50_ms ?? 0) < 500 ? "degraded"
        : "outage",
      latencyMs: latency?.db_sync_p50_ms ?? 0,
    },
    {
      id: "sync-p99",
      name: "DB Sync P99",
      status: (latency?.db_sync_p99_ms ?? 0) < 500 ? "operational"
        : (latency?.db_sync_p99_ms ?? 0) < 1000 ? "degraded"
        : "outage",
      latencyMs: latency?.db_sync_p99_ms ?? 0,
    },
  ];

  const eventRows: EventRow[] = (sync.events ?? []).map((e) => ({
    status: e.status,
    count: formatNumber(e.count ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Sync Latency
        </h2>
        <MnSystemStatus
          services={services}
          environment={`P50: ${formatNumber(latency?.db_sync_p50_ms ?? 0)}ms · P99: ${formatNumber(latency?.db_sync_p99_ms ?? 0)}ms`}
        />
      </div>

      {eventRows.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Sync Events
          </h2>
          <MnDataTable
            columns={eventColumns}
            data={eventRows}
            compact
            emptyMessage="No sync events"
          />
        </div>
      )}
    </div>
  );
}
