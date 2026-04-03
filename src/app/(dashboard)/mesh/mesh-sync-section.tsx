"use client";

import { useApiQuery } from "@/hooks";
import { meshApi } from "@/lib/api";
import type { MeshSyncStatus } from "@/lib/api";
import { MnSystemStatus } from "@/components/maranello";
import type { Service, Incident } from "@/components/maranello";

const SYNC_STATE_LABEL: Record<string, string> = {
  synced: "Fully Synced",
  syncing: "Syncing…",
  diverged: "Diverged",
  offline: "Offline",
};

interface MeshSyncSectionProps {
  initial: MeshSyncStatus | null;
}

export function MeshSyncSection({ initial }: MeshSyncSectionProps) {
  const { data } = useApiQuery(
    () => meshApi.getMeshSyncStatus(),
    { pollInterval: 10000 },
  );

  const sync = data ?? initial;
  if (!sync) return null;

  const services: Service[] = [
    {
      id: "crdt-state",
      name: "CRDT State",
      status: sync.state === "synced" ? "operational"
        : sync.state === "syncing" ? "degraded"
        : "outage",
      latencyMs: sync.pendingOps,
    },
    {
      id: "pending-ops",
      name: "Pending Operations",
      status: sync.pendingOps === 0 ? "operational"
        : sync.pendingOps < 10 ? "degraded"
        : "outage",
    },
    {
      id: "conflict-resolution",
      name: "Conflict Resolution",
      status: "operational",
    },
  ];

  const incidents: Incident[] = sync.state === "diverged"
    ? [{
        id: "diverged",
        title: "CRDT state diverged — manual reconciliation may be needed",
        date: sync.lastSync,
        severity: "outage",
      }]
    : [];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
        Sync Status — {SYNC_STATE_LABEL[sync.state] ?? sync.state}
      </h2>
      <MnSystemStatus
        services={services}
        incidents={incidents}
        version={`${sync.conflictsResolved} conflicts resolved`}
        environment={`Last sync: ${new Date(sync.lastSync).toLocaleTimeString()}`}
      />
    </div>
  );
}
