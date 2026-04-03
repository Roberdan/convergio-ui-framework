"use client";

import { useApiQuery } from "@/hooks";
import { operationsApi } from "@/lib/api";
import type { Worker } from "@/lib/api";
import { MnDataTable, MnSystemStatus } from "@/components/maranello";
import type { DataTableColumn, Service } from "@/components/maranello";

type WorkerRow = Record<string, unknown> & {
  id: string;
  name: string;
  status: string;
  currentTask: string;
  cpu: string;
  memory: string;
  lastHeartbeat: string;
};

const workerColumns: DataTableColumn<WorkerRow>[] = [
  { key: "name", label: "Worker", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "currentTask", label: "Current Task" },
  { key: "cpu", label: "CPU", align: "right", sortable: true },
  { key: "memory", label: "Memory", align: "right", sortable: true },
  { key: "lastHeartbeat", label: "Last Heartbeat", sortable: true },
];

interface WorkersTabProps {
  initial: Worker[] | null;
}

export function WorkersTab({ initial }: WorkersTabProps) {
  const { data } = useApiQuery(
    () => operationsApi.getWorkers(),
    { pollInterval: 10000 },
  );

  const workers = data ?? initial;
  if (!workers) return null;

  const services: Service[] = workers.map((w) => ({
    id: w.id,
    name: w.name,
    status: w.status === "active" ? "operational" as const
      : w.status === "idle" ? "operational" as const
      : w.status === "error" ? "outage" as const
      : "degraded" as const,
    latencyMs: w.cpu,
    uptime: w.uptime,
  }));

  const rows: WorkerRow[] = workers.map((w) => ({
    id: w.id,
    name: w.name,
    status: w.status,
    currentTask: w.currentTask ?? "—",
    cpu: `${w.cpu}%`,
    memory: `${w.memory}%`,
    lastHeartbeat: new Date(w.lastHeartbeat).toLocaleTimeString(),
  }));

  return (
    <div className="space-y-4 mt-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Worker Health
        </h3>
        <MnSystemStatus
          services={services}
          environment={`${workers.filter((w) => w.status === "active").length} active`}
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
