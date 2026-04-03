"use client";

import { useApiQuery } from "@/hooks";
import { operationsApi } from "@/lib/api";
import type { Worker } from "@/lib/api";
import { MnDataTable, MnSystemStatus } from "@/components/maranello";
import type { DataTableColumn, Service } from "@/components/maranello";

type WorkerRow = Record<string, unknown> & {
  id: string;
  agentType: string;
  host: string;
  model: string;
  status: string;
  description: string;
  startedAt: string;
};

const workerColumns: DataTableColumn<WorkerRow>[] = [
  { key: "id", label: "Worker ID", sortable: true },
  { key: "agentType", label: "Type", sortable: true },
  { key: "host", label: "Host", sortable: true },
  { key: "model", label: "Model", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "description", label: "Description" },
  { key: "startedAt", label: "Started", sortable: true },
];

interface WorkersTabProps {
  initial: Worker[] | null;
}

export function WorkersTab({ initial }: WorkersTabProps) {
  const { data } = useApiQuery(
    () => operationsApi.getWorkers(),
    { pollInterval: 10000 },
  );

  const workers = Array.isArray(data) ? data : Array.isArray(initial) ? initial : null;
  if (!workers?.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 mt-4">
        <p className="text-sm text-muted-foreground">No workers registered</p>
      </div>
    );
  }

  const services: Service[] = workers.map((w) => ({
    id: w.id,
    name: w.agent_id ?? w.id,
    status: w.status === "running" || w.status === "active"
      ? "operational" as const
      : w.status === "idle"
        ? "operational" as const
        : w.status === "error"
          ? "outage" as const
          : "degraded" as const,
  }));

  const rows: WorkerRow[] = workers.map((w) => ({
    id: w.id,
    agentType: w.agent_type ?? "—",
    host: w.host ?? "—",
    model: w.model ?? "—",
    status: w.status ?? "unknown",
    description: w.description ?? "—",
    startedAt: w.started_at
      ? new Date(w.started_at).toLocaleTimeString()
      : "—",
  }));

  const activeCount = workers.filter(
    (w) => w.status === "running" || w.status === "active",
  ).length;

  return (
    <div className="space-y-4 mt-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Worker Health
        </h3>
        <MnSystemStatus
          services={services}
          environment={`${activeCount} active`}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <MnDataTable
          columns={workerColumns}
          data={rows}
          compact
          emptyMessage="No workers registered"
        />
      </div>
    </div>
  );
}
