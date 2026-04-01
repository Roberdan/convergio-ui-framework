"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export type OkrStatus = "on-track" | "at-risk" | "behind"

export interface KeyResult {
  id: string; title: string; current: number; target: number; unit?: string
}

export interface Objective {
  id: string; title: string; status?: OkrStatus; keyResults: KeyResult[]
}

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold leading-tight",
  {
    variants: {
      status: {
        "on-track":
          "bg-[var(--mn-success-bg)] text-[var(--mn-success)] border border-[color-mix(in_srgb,var(--mn-success)_24%,transparent)]",
        "at-risk":
          "bg-[var(--mn-warning-bg)] text-[var(--mn-warning)] border border-[color-mix(in_srgb,var(--mn-warning)_24%,transparent)]",
        behind:
          "bg-[var(--mn-error-bg)] text-[var(--mn-error)] border border-[color-mix(in_srgb,var(--mn-error)_24%,transparent)]",
      },
    },
    defaultVariants: {
      status: "on-track",
    },
  },
)

const progressBarVariants = cva("h-1.5 rounded-full transition-all duration-300", {
  variants: {
    status: {
      "on-track": "bg-[var(--mn-success)]",
      "at-risk": "bg-[var(--mn-warning)]",
      behind: "bg-[var(--mn-error)]",
    },
  },
  defaultVariants: {
    status: "on-track",
  },
})

function computeProgress(keyResults: KeyResult[]): number {
  if (keyResults.length === 0) return 0
  const sum = keyResults.reduce((acc, kr) => {
    const pct = kr.target > 0 ? Math.min(kr.current / kr.target, 1) : 0
    return acc + pct
  }, 0)
  return Math.round((sum / keyResults.length) * 100)
}

function inferStatus(progress: number): OkrStatus {
  if (progress >= 70) return "on-track"
  if (progress >= 40) return "at-risk"
  return "behind"
}

const statusLabel: Record<OkrStatus, string> = {
  "on-track": "On Track", "at-risk": "At Risk", behind: "Behind",
}

function KeyResultRow({ kr, status }: { kr: KeyResult; status: OkrStatus }) {
  const pct = kr.target > 0 ? Math.round((kr.current / kr.target) * 100) : 0

  return (
    <div className="flex flex-col gap-1 py-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--mn-text-secondary)] truncate pr-2">
          {kr.title}
        </span>
        <span className="text-[var(--mn-text-muted)] font-mono text-[0.7rem] shrink-0">
          {kr.current}
          {kr.unit ? kr.unit : ""} / {kr.target}
          {kr.unit ? kr.unit : ""} ({pct}%)
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--mn-border)]">
        <div
          className={progressBarVariants({ status })}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

function ObjectiveCard({
  objective,
  defaultOpen = false,
}: {
  objective: Objective
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const progress = computeProgress(objective.keyResults)
  const status = objective.status ?? inferStatus(progress)

  return (
    <div className="rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--mn-border)]"
      >
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <svg
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-[var(--mn-text-muted)] transition-transform duration-200",
              open && "rotate-90",
            )}
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6 3l5 5-5 5V3z" />
          </svg>
          <span className="text-sm font-medium text-[var(--mn-text)] truncate">
            {objective.title}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={statusVariants({ status })}>{statusLabel[status]}</span>
          <span className="text-xs font-semibold text-[var(--mn-text-muted)] tabular-nums w-10 text-right">
            {progress}%
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--mn-border)] px-4 py-2 space-y-0.5">
          {objective.keyResults.map((kr) => (
            <KeyResultRow key={kr.id} kr={kr} status={status} />
          ))}
        </div>
      )}
    </div>
  )
}

export interface MnOkrProps extends React.HTMLAttributes<HTMLDivElement> {
  /** List of objectives with nested key results. */
  objectives: Objective[]
  /** Dashboard title. */
  title?: string
  /** Time period label (e.g. "Q2 2025"). */
  period?: string
  /** Whether to expand the first objective by default. */
  defaultOpenFirst?: boolean
}

/** OKR dashboard panel with objective cards, progress bars, and status indicators. */
export function MnOkr({
  objectives,
  title = "OKR Dashboard",
  period,
  defaultOpenFirst = true,
  className,
  ...props
}: MnOkrProps) {
  const overallProgress =
    objectives.length > 0
      ? Math.round(
          objectives.reduce(
            (acc, o) => acc + computeProgress(o.keyResults),
            0,
          ) / objectives.length,
        )
      : 0

  const overallStatus = inferStatus(overallProgress)

  return (
    <div
      role="region"
      aria-label={title}
      {...props}
      className={cn("w-full space-y-4", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-[var(--mn-text)]">
            {title}
          </h2>
          {period && (
            <span className="text-xs text-[var(--mn-text-muted)]">{period}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={statusVariants({ status: overallStatus })}>
            {statusLabel[overallStatus]}
          </span>
          <span className="text-sm font-bold text-[var(--mn-text)] tabular-nums">
            {overallProgress}%
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 w-full rounded-full bg-[var(--mn-border)]">
        <div
          className={cn(progressBarVariants({ status: overallStatus }), "h-2")}
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Objective cards */}
      <div className="space-y-2">
        {objectives.map((obj, i) => (
          <ObjectiveCard
            key={obj.id}
            objective={obj}
            defaultOpen={defaultOpenFirst && i === 0}
          />
        ))}
        {objectives.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--mn-text-muted)]">
            No objectives defined.
          </p>
        )}
      </div>
    </div>
  )
}

export { statusVariants as mnOkrStatusVariants, progressBarVariants as mnOkrProgressVariants }
