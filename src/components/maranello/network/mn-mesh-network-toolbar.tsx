"use client"

import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────────── */
export type MeshAction = "add-peer" | "discover" | "full-sync" | "push"

export interface MnMeshNetworkToolbarProps {
  onlineCount: number
  totalCount: number
  onAction?: (action: MeshAction) => void
  className?: string
}

/* ── Legend dot ─────────────────────────────────────────────── */
function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[0.65rem] text-[var(--mn-text-muted)]">
      <span className="size-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  )
}

/* ── Action button ─────────────────────────────────────────── */
function ActionBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider",
        "border border-[var(--mn-border)] bg-[var(--mn-surface)] text-[var(--mn-text-muted)]",
        "transition-colors hover:bg-[var(--mn-border)] hover:text-[var(--mn-text)]",
      )}
    >
      {label}
    </button>
  )
}

/* ── Toolbar ───────────────────────────────────────────────── */
export function MnMeshNetworkToolbar({
  onlineCount,
  totalCount,
  onAction,
  className,
}: MnMeshNetworkToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-b border-[var(--mn-border)] px-4 py-2.5",
        className,
      )}
    >
      {/* Title */}
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--mn-text)]">
        <span aria-hidden="true">◆</span>
        MESH NETWORK
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2">
        <Dot color="var(--mn-success, #22c55e)" label="On" />
        <Dot color="var(--mn-error, #ef4444)" label="Off" />
        <Dot color="var(--mn-info, #3b82f6)" label="Sync" />
        <Dot color="var(--mn-warning, #f59e0b)" label="Drift" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <ActionBtn label="+ Add Peer" onClick={() => onAction?.("add-peer")} />
        <ActionBtn label="Discover" onClick={() => onAction?.("discover")} />
        <ActionBtn label="Full Sync" onClick={() => onAction?.("full-sync")} />
        <ActionBtn label="Push" onClick={() => onAction?.("push")} />
      </div>

      {/* Counter */}
      <span className="text-[0.7rem] font-mono tabular-nums text-[var(--mn-text-muted)]">
        {onlineCount}/{totalCount} online
      </span>
    </div>
  )
}
