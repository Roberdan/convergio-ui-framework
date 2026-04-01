"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export type ServiceStatus = "operational" | "degraded" | "outage"

export interface Service {
  id: string; name: string; status: ServiceStatus; uptime?: number; latencyMs?: number
}

export interface Incident {
  id: string; title: string; date: string; severity: ServiceStatus; resolved?: boolean
}

const dotVariants = cva(
  "inline-block h-2 w-2 shrink-0 rounded-full transition-colors duration-300",
  {
    variants: {
      status: {
        operational: "bg-[var(--mn-success)]",
        degraded: "bg-[var(--mn-warning)]",
        outage: "bg-[var(--mn-error)]",
      },
    },
    defaultVariants: {
      status: "operational",
    },
  },
)

const statusLabelVariants = cva("text-xs font-medium", {
  variants: {
    status: {
      operational: "text-[var(--mn-success)]",
      degraded: "text-[var(--mn-warning)]",
      outage: "text-[var(--mn-error)]",
    },
  },
  defaultVariants: {
    status: "operational",
  },
})

const statusLabel: Record<ServiceStatus, string> = {
  operational: "Operational", degraded: "Degraded", outage: "Outage",
}

function deriveOverall(services: Service[]): ServiceStatus {
  if (services.some((s) => s.status === "outage")) return "outage"
  if (services.some((s) => s.status === "degraded")) return "degraded"
  return "operational"
}

const overallLabel: Record<ServiceStatus, string> = {
  operational: "All Systems Operational", degraded: "Partial Degradation", outage: "Major Outage",
}

function ServiceRow({ service }: { service: Service }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-[var(--mn-border)]">
      <span className={dotVariants({ status: service.status })} aria-hidden="true" />
      <span className="flex-1 text-sm text-[var(--mn-text)] truncate">
        {service.name}
      </span>
      {service.uptime != null && (
        <span className="text-[0.7rem] font-mono text-[var(--mn-text-muted)] tabular-nums">
          {service.uptime.toFixed(1)}%
        </span>
      )}
      {service.latencyMs != null && (
        <span
          className={cn(
            "text-[0.7rem] font-mono tabular-nums",
            service.status === "outage"
              ? "text-[var(--mn-error)] font-semibold"
              : "text-[var(--mn-text-muted)]",
          )}
        >
          {service.status === "outage" ? "DOWN" : `${service.latencyMs}ms`}
        </span>
      )}
      <span className={statusLabelVariants({ status: service.status })}>
        {statusLabel[service.status]}
      </span>
    </div>
  )
}

function IncidentRow({ incident }: { incident: Incident }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2">
      <span
        className={dotVariants({ status: incident.severity })}
        aria-hidden="true"
        style={{ marginTop: "0.35rem" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--mn-text)] truncate">{incident.title}</p>
        <p className="text-[0.7rem] text-[var(--mn-text-muted)]">
          {incident.date}
          {incident.resolved && " · Resolved"}
        </p>
      </div>
    </div>
  )
}

export interface MnSystemStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  /** List of services to display. */
  services: Service[]
  /** Recent incidents to show. */
  incidents?: Incident[]
  /** Polling interval in milliseconds. Set to 0 to disable. */
  refreshInterval?: number
  /** Callback invoked on each refresh tick. Use this to update service data. */
  onRefresh?: () => void
  /** Application version label. */
  version?: string
  /** Environment label (e.g. "production"). */
  environment?: string
}

/** System health dashboard with service statuses, uptime, and incident history. */
export function MnSystemStatus({
  services,
  incidents,
  refreshInterval = 0,
  onRefresh,
  version,
  environment,
  className,
  ...props
}: MnSystemStatusProps) {
  // Polling
  React.useEffect(() => {
    if (!onRefresh || refreshInterval <= 0) return
    const timer = setInterval(onRefresh, refreshInterval)
    return () => clearInterval(timer)
  }, [onRefresh, refreshInterval])

  const overall = deriveOverall(services)

  return (
    <div
      role="status"
      aria-label="System status"
      aria-live="polite"
      {...props}
      className={cn(
        "w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--mn-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn(dotVariants({ status: overall }), "h-2.5 w-2.5")} aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--mn-text)]">
            {overallLabel[overall]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[0.75rem] text-[var(--mn-text-muted)]">
          {version && <span>{version}</span>}
          {version && environment && <span>·</span>}
          {environment && <span>{environment}</span>}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh status"
              className="ml-1 rounded p-1 transition-colors hover:bg-[var(--mn-border)]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M13.65 2.35A7.96 7.96 0 008 0a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L10 6h6V0l-2.35 2.35z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Service list */}
      <div className="divide-y divide-[var(--mn-border)]">
        {services.map((svc) => (
          <ServiceRow key={svc.id} service={svc} />
        ))}
        {services.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--mn-text-muted)]">
            No services configured.
          </p>
        )}
      </div>

      {/* Incidents */}
      {incidents && incidents.length > 0 && (
        <div className="border-t border-[var(--mn-border)]">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--mn-text-muted)]">
              Recent Incidents
            </h3>
          </div>
          <div className="divide-y divide-[var(--mn-border)]">
            {incidents.map((inc) => (
              <IncidentRow key={inc.id} incident={inc} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { dotVariants as mnSystemStatusDotVariants, statusLabelVariants as mnSystemStatusLabelVariants }
