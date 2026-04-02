"use client";

import { useApiQuery } from "@/hooks";
import { settingsApi } from "@/lib/api";
import { MnSystemStatus, MnSpinner, MnBadge } from "@/components/maranello";

export function SettingsSystem() {
  const { data: health, loading: healthLoading } = useApiQuery(
    () => settingsApi.getDeepHealth(),
    { pollInterval: 15000 },
  );
  const { data: readiness } = useApiQuery(
    () => settingsApi.getReadinessChecks(),
    { pollInterval: 30000 },
  );
  const { data: kernel } = useApiQuery(
    () => settingsApi.getKernelStatus(),
    { pollInterval: 15000 },
  );

  if (healthLoading && !health) {
    return (
      <div className="flex items-center justify-center h-32 mt-4">
        <MnSpinner size="md" label="Loading system status..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {health && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground">
              System Health
            </h2>
            <div className="flex items-center gap-2">
              {health.version && (
                <span className="text-xs text-muted-foreground font-mono">
                  v{health.version}
                </span>
              )}
              <MnBadge
                label={health.status}
                tone={
                  health.status === "healthy"
                    ? "success"
                    : health.status === "degraded"
                      ? "warning"
                      : "danger"
                }
              />
            </div>
          </div>
          <MnSystemStatus
            services={health.services}
            version={health.version}
          />
        </div>
      )}

      {readiness && readiness.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Readiness Checks
          </h2>
          <div className="space-y-2">
            {readiness.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm">{check.name}</span>
                <MnBadge
                  label={check.ready ? "Ready" : "Not Ready"}
                  tone={check.ready ? "success" : "danger"}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {kernel && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Kernel Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <MnBadge
                label={kernel.status}
                tone={kernel.status === "running" ? "success" : "warning"}
              />
            </div>
            {kernel.pid && (
              <div>
                <p className="text-xs text-muted-foreground">PID</p>
                <p className="font-mono text-sm">{kernel.pid}</p>
              </div>
            )}
            {kernel.memory !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground">Memory</p>
                <p className="font-mono text-sm">{(kernel.memory / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            )}
            {kernel.cpu !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground">CPU</p>
                <p className="font-mono text-sm">{kernel.cpu.toFixed(1)}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
