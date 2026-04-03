"use client";

import { useApiQuery } from "@/hooks";
import { meshApi } from "@/lib/api";
import type { MeshDiagnostics } from "@/lib/api";
import { MnSystemStatus, MnBinnacle } from "@/components/maranello";
import type { Service, BinnacleEntry } from "@/components/maranello";

interface MeshDiagnosticsSectionProps {
  initial: MeshDiagnostics | null;
}

export function MeshDiagnosticsSection({ initial }: MeshDiagnosticsSectionProps) {
  const { data } = useApiQuery(
    () => meshApi.getMeshDiagnostics(),
    { pollInterval: 20000 },
  );

  const diag = data ?? initial;
  if (!diag) return null;

  const services: Service[] = diag.entries.map((e) => ({
    id: e.id,
    name: `[${e.category}] ${e.message.slice(0, 60)}`,
    status: e.severity === "ok" ? "operational" as const
      : e.severity === "warning" ? "degraded" as const
      : "outage" as const,
  }));

  const binnacleEntries: BinnacleEntry[] = diag.entries.map((e) => ({
    timestamp: e.timestamp,
    severity: e.severity === "ok" ? "info" as const
      : e.severity === "warning" ? "warning" as const
      : "critical" as const,
    source: e.nodeId ?? e.category,
    message: e.message,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Diagnostics — {diag.overall}
        </h2>
        <MnSystemStatus
          services={services}
          environment={`Checked: ${new Date(diag.checkedAt).toLocaleTimeString()}`}
        />
      </div>

      {binnacleEntries.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Mesh Event Log
          </h2>
          <MnBinnacle
            entries={binnacleEntries}
            maxVisible={30}
            ariaLabel="Mesh diagnostic events"
          />
        </div>
      )}
    </div>
  );
}
