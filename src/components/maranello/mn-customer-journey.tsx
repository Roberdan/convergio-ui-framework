"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// --- Types ---

export type EngagementStatus = "completed" | "active" | "pending" | "blocked"
export type EngagementType = "opportunity" | "contract" | "ticket" | "meeting" | "task"

export interface JourneyEngagement {
  id: string
  title: string
  avatar?: string
  status: EngagementStatus
  type: EngagementType
  date?: string
  assignee?: string
}

export interface JourneyPhase {
  id: string
  label: string
  engagements: JourneyEngagement[]
}

// --- CVA variants ---

const journeyVariants = cva("flex gap-4 overflow-auto", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    compact: {
      true: "gap-2",
      false: "",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    compact: false,
  },
})

const cardVariants = cva(
  "relative flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors outline-none cursor-pointer",
  {
    variants: {
      status: {
        completed: "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20",
        active: "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20",
        pending: "border-border bg-muted/30",
        blocked: "border-red-500/30 bg-red-50/50 dark:bg-red-950/20",
      },
      selected: { true: "ring-2 ring-ring", false: "" },
    },
    defaultVariants: { status: "pending", selected: false },
  },
)

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
  {
    variants: {
      status: {
        completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        active: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        pending: "bg-muted text-muted-foreground",
        blocked: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      },
    },
    defaultVariants: { status: "pending" },
  },
)

// --- Constants ---

const TYPE_ICONS: Record<EngagementType, string> = {
  opportunity: "\u2605", contract: "\u2709", ticket: "\u2691",
  meeting: "\u260E", task: "\u2713",
}

const STATUS_LABELS: Record<EngagementStatus, string> = {
  completed: "Completed", active: "Active", pending: "Pending", blocked: "Blocked",
}

// --- Helpers ---

function initials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

// --- Props ---

export interface MnCustomerJourneyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">,
    VariantProps<typeof journeyVariants> {
  /** Phase data for the journey swimlane. */
  phases: JourneyPhase[]
  /** ID of the currently-selected engagement. */
  selected?: string | null
  /** Called when an engagement card is clicked. */
  onSelect?: (engagement: JourneyEngagement) => void
}

// --- Sub-components ---

function Avatar({ engagement }: { engagement: JourneyEngagement }) {
  if (engagement.avatar) {
    return (
      <img
        src={engagement.avatar}
        alt={engagement.assignee ?? ""}
        className="size-8 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {engagement.assignee ? initials(engagement.assignee) : "?"}
    </span>
  )
}

function EngagementCard({
  engagement,
  isSelected,
  onClick,
}: {
  engagement: JourneyEngagement
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <div
      role="listitem"
      tabIndex={0}
      className={cardVariants({
        status: engagement.status,
        selected: isSelected,
      })}
      data-id={engagement.id}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <Avatar engagement={engagement} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-medium leading-tight">
          {engagement.title}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={badgeVariants({ status: engagement.status })}>
            {STATUS_LABELS[engagement.status]}
          </span>
          <span
            className="text-xs text-muted-foreground"
            aria-label={engagement.type}
          >
            {TYPE_ICONS[engagement.type]}
          </span>
        </div>
        {engagement.date && (
          <span className="text-[11px] text-muted-foreground">
            {engagement.date}
          </span>
        )}
      </div>
    </div>
  )
}

function PhaseColumn({
  phase,
  selectedId,
  onSelect,
}: {
  phase: JourneyPhase
  selectedId: string | null
  onSelect: (engagement: JourneyEngagement) => void
}) {
  return (
    <div
      className="flex min-w-[200px] flex-1 flex-col gap-2"
      role="group"
      aria-label={phase.label}
    >
      <div className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {phase.label}
      </div>
      {phase.engagements.map((eng) => (
        <EngagementCard
          key={eng.id}
          engagement={eng}
          isSelected={eng.id === selectedId}
          onClick={() => onSelect(eng)}
        />
      ))}
    </div>
  )
}

// --- Component ---

/**
 * `MnCustomerJourney` renders a horizontal or vertical swimlane visualization
 * of customer engagement phases. Each phase column contains engagement cards
 * with status badges and type icons.
 */
export function MnCustomerJourney({
  phases,
  selected,
  orientation,
  compact,
  onSelect,
  className,
  ...props
}: MnCustomerJourneyProps) {
  const handleSelect = React.useCallback(
    (engagement: JourneyEngagement) => {
      onSelect?.(engagement)
    },
    [onSelect],
  )

  return (
    <div
      {...props}
      role="list"
      aria-label="Customer journey"
      className={cn(journeyVariants({ orientation, compact }), className)}
    >
      {phases.map((phase) => (
        <PhaseColumn
          key={phase.id}
          phase={phase}
          selectedId={selected ?? null}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
