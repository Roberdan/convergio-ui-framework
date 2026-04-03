"use client"

import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { MeshNode } from "./mn-mesh-network"

/* ── CVA variants ──────────────────────────────────────────── */
const statusDot = cva("size-2 shrink-0 rounded-full", {
  variants: {
    status: {
      online: "bg-[var(--mn-success,#22c55e)]",
      offline: "bg-[var(--mn-error,#ef4444)]",
      degraded: "bg-[var(--mn-warning,#f59e0b)]",
    },
  },
  defaultVariants: { status: "online" },
})

/* ── Helpers ───────────────────────────────────────────────── */
const TYPE_LABEL: Record<string, string> = {
  coordinator: "COORDINATOR",
  worker: "WORKER",
  kernel: "KERNEL",
  relay: "RELAY",
}

function ResourceBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  const barColor =
    pct > 80
      ? "bg-[var(--mn-error,#ef4444)]"
      : pct > 60
        ? "bg-[var(--mn-warning,#f59e0b)]"
        : "bg-[var(--mn-success,#22c55e)]"
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 text-[0.6rem] font-mono uppercase text-[var(--mn-text-muted)]">
        {label}
      </span>
      <div className="h-1.5 flex-1 rounded-full bg-[var(--mn-border)]">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-[0.6rem] font-mono tabular-nums text-[var(--mn-text-muted)]">
        {pct}%
      </span>
    </div>
  )
}

/* ── Card action icons ─────────────────────────────────────── */
function CardAction({ icon, title, onClick }: { icon: string; title: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded p-1 text-[0.7rem] leading-none",
        "text-[var(--mn-text-muted)] transition-colors",
        "hover:bg-[var(--mn-border)] hover:text-[var(--mn-text)]",
      )}
    >
      {icon}
    </button>
  )
}

/* ── Status line builder ───────────────────────────────────── */
function buildStatusLine(node: MeshNode): string {
  const parts: string[] = []
  if (node.activeTasks != null) parts.push(`${node.activeTasks} active tasks`)
  if (node.delegatedTasks != null) parts.push(`${node.delegatedTasks} delegated`)
  if (node.syncPercent != null) parts.push(`sync ${node.syncPercent}%`)
  if (node.driftPercent != null) parts.push(`drift ${node.driftPercent}%`)
  return parts.join(" · ") || (node.status === "offline" ? "offline" : "idle")
}

/* ── Node card ─────────────────────────────────────────────── */
export interface MnMeshNetworkCardProps {
  node: MeshNode
  selected?: boolean
  onSelect?: (node: MeshNode) => void
  onAction?: (node: MeshNode, action: string) => void
}

export function MnMeshNetworkCard({ node, selected, onSelect, onAction }: MnMeshNetworkCardProps) {
  const location = (node.location ?? "local").toUpperCase()
  const typeLabel = TYPE_LABEL[node.type] ?? node.type.toUpperCase()
  const hasResources = node.cpu != null || node.ram != null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${node.label}: ${node.status}`}
      onClick={() => onSelect?.(node)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect?.(node)
        }
      }}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 transition-colors cursor-pointer",
        "border-[var(--mn-border)] bg-[var(--mn-surface-raised,var(--mn-surface))]",
        "hover:border-[var(--mn-accent)]",
        selected && "ring-1 ring-[var(--mn-accent)] border-[var(--mn-accent)]",
        node.coldStandby && "opacity-60",
      )}
    >
      {/* Header: name + status dot */}
      <div className="flex items-center gap-2">
        <span className={statusDot({ status: node.status })} aria-hidden="true" />
        <span className="flex-1 truncate text-sm font-semibold text-[var(--mn-text)]">
          {node.label}
        </span>
        {node.latencyMs != null && (
          <span className="text-[0.6rem] font-mono tabular-nums text-[var(--mn-text-muted)]">
            {node.latencyMs}ms
          </span>
        )}
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-1.5">
        <span className={statusDot({ status: node.status })} aria-hidden="true" />
        <span className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--mn-text-muted)]">
          {typeLabel} · {location}
        </span>
      </div>

      {/* Agent badges */}
      {node.agents && node.agents.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {node.agents.map((agent) => (
            <span
              key={agent}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase",
                "border-[var(--mn-warning,#f59e0b)] text-[var(--mn-warning,#f59e0b)]",
              )}
            >
              {agent}
            </span>
          ))}
        </div>
      )}

      {/* Resource bars */}
      {hasResources && (
        <div className="flex flex-col gap-1">
          {node.cpu != null && <ResourceBar label="CPU" value={node.cpu} />}
          {node.ram != null && <ResourceBar label="RAM" value={node.ram} />}
        </div>
      )}

      {/* Status line */}
      <p className="text-[0.65rem] text-[var(--mn-text-muted)]">{buildStatusLine(node)}</p>

      {/* Action buttons row */}
      <div className="flex items-center gap-1 border-t border-[var(--mn-border)] pt-1.5 -mx-1">
        <CardAction icon="⟲" title="Sync" onClick={() => onAction?.(node, "sync")} />
        <CardAction icon="↑" title="Push" onClick={() => onAction?.(node, "push")} />
        <CardAction icon="⏻" title="Toggle" onClick={() => onAction?.(node, "toggle")} />
      </div>
    </div>
  )
}

export { statusDot as meshNodeStatusDot }
