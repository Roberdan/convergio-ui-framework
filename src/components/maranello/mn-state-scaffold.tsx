"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StateScaffoldState =
  | "loading"
  | "empty"
  | "error"
  | "partial"
  | "ready"

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const scaffoldVariants = cva("relative", {
  variants: {
    state: {
      loading: "",
      empty: "",
      error: "",
      partial: "",
      ready: "",
    },
  },
  defaultVariants: {
    state: "loading",
  },
})

const panelVariants = cva("flex flex-col items-center justify-center gap-3", {
  variants: {
    kind: {
      loading: "py-12",
      message: "py-12 text-center",
      banner: "rounded-md border border-border bg-muted/40 px-4 py-3 text-sm",
    },
  },
  defaultVariants: {
    kind: "message",
  },
})

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MnStateScaffoldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scaffoldVariants> {
  /** Current scaffold state. */
  state: StateScaffoldState
  /** Optional message displayed in non-ready states. */
  message?: string
  /** Label for the action button (error retry or empty action). */
  actionLabel?: string
  /** Called when the retry button is clicked (error state). */
  onRetry?: () => void
  /** Called when the action button is clicked (empty state). */
  onAction?: () => void
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-full animate-pulse rounded bg-muted",
        className,
      )}
    />
  )
}

function LoadingPanel() {
  return (
    <div
      className={panelVariants({ kind: "loading" })}
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-xs flex-col gap-3">
        <SkeletonBar className="w-3/4" />
        <SkeletonBar />
        <SkeletonBar className="w-1/2" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

function ActionButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="mt-2 inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function MessagePanel({
  text,
  kind,
  actionLabel,
  onAction,
}: {
  text: string
  kind: "message" | "banner"
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div
      className={panelVariants({ kind })}
      role="status"
      aria-live="polite"
    >
      <p className="text-muted-foreground">{text}</p>
      {actionLabel && onAction && (
        <ActionButton label={actionLabel} onClick={onAction} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `MnStateScaffold` manages five visual states for an async data region:
 * **loading**, **empty**, **error**, **partial**, and **ready**.
 *
 * Children are rendered when the state is `ready` or `partial`.
 */
export function MnStateScaffold({
  state,
  message,
  actionLabel,
  onRetry,
  onAction,
  className,
  children,
  ...props
}: MnStateScaffoldProps) {
  const showContent = state === "ready" || state === "partial"

  const statusPanel = React.useMemo(() => {
    switch (state) {
      case "ready":
        return null

      case "loading":
        return <LoadingPanel />

      case "partial":
        return (
          <MessagePanel
            text={message ?? "Showing partial data."}
            kind="banner"
          />
        )

      case "error":
        return (
          <MessagePanel
            text={message ?? "Something went wrong."}
            kind="message"
            actionLabel={actionLabel ?? (onRetry ? "Retry" : undefined)}
            onAction={onRetry}
          />
        )

      case "empty":
        return (
          <MessagePanel
            text={message ?? "No data available."}
            kind="message"
            actionLabel={actionLabel ?? (onAction ? "Take action" : undefined)}
            onAction={onAction}
          />
        )

      default:
        return null
    }
  }, [state, message, actionLabel, onRetry, onAction])

  return (
    <div
      {...props}
      className={cn(scaffoldVariants({ state }), className)}
      aria-busy={state === "loading"}
      {...(state === "error" ? { role: "alert" as const } : {})}
      data-state={state}
    >
      {statusPanel}
      <div className={cn(!showContent && "hidden")}>{children}</div>
    </div>
  )
}
