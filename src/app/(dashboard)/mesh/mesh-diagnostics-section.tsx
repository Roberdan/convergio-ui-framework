"use client";

import { useApiQuery } from "@/hooks";
import { meshApi } from "@/lib/api";
import type { MeshDiagnostics } from "@/lib/api";
import { MnSystemStatus, MnBinnacle } from "@/components/maranello";
import type { Service, BinnacleEntry } from "@/components/maranello";
import { formatNumber } from "@/components/maranello/mn-format";

interface MeshDiagnosticsSectionProps {
  initial: MeshDiagnostics | null;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function MeshDiagnosticsSection({ initial }: MeshDiagnosticsSectionProps) {
  const { data } = useApiQuery(
    () => meshApi.getMeshDiagnostics(),
    { pollInterval: 20000 },
  );

  const diag = data ?? initial;
  if (!diag) return null;

  const overallStatus = diag.ok
    ? (diag.online_peers ?? 0) === (diag.total_peers ?? 0)
      ? "healthy"
      : "degraded"
    : "unhealthy";

  const services: Service[] = [
    {
      id: "peers",
      name: `Peers: ${formatNumber(diag.online_peers ?? 0)} / ${formatNumber(diag.total_peers ?? 0)}`,
      status: (diag.online_peers ?? 0) === (diag.total_peers ?? 0)
        ? "operational"
        : (diag.online_peers ?? 0) > 0
          ? "degraded"
          : "outage",
    },
    {
      id: "uptime",
      name: `Uptime: ${formatUptime(diag.uptime_secs ?? 0)}`,
      status: "operational",
    },
    {
      id: "version",
      name: `Version: ${diag.version ?? "unknown"}`,
      status: "operational",
    },
  ];

  const warningEntries: BinnacleEntry[] = (diag.warnings ?? []).map((w) => ({
    timestamp: new Date().toISOString(),
    severity: "warning" as const,
    source: "mesh",
    message: typeof w === "string" ? w : String(w),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Diagnostics — {overallStatus}
        </h2>
        <MnSystemStatus
          services={services}
          version={diag.version ?? undefined}
          environment={`Uptime: ${formatUptime(diag.uptime_secs ?? 0)}`}
        />
      </div>

      {warningEntries.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Warnings
          </h2>
          <MnBinnacle
            entries={warningEntries}
            maxVisible={30}
            ariaLabel="Mesh diagnostic warnings"
          />
        </div>
      )}
    </div>
  );
}
