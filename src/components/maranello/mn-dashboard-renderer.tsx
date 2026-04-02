"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

/* Types */
type WidgetType = "kpi-strip" | "stat-card" | "chart" | "gauge" | "legend" | "table-summary" | "custom"
interface RendererWidget {
  type: WidgetType; dataKey: string; span?: number; options?: Record<string, unknown>
}
interface RendererRow { columns: RendererWidget[] }
interface RendererSchema { rows: RendererRow[] }
type WidgetState = "loading" | "ready" | "empty" | "error"
type RenderWidgetFn = (widget: RendererWidget, data: unknown, state: WidgetState) => React.ReactNode

/* CVA variants */

const rendererVariants = cva("flex flex-col", {
  variants: {
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
    },
  },
  defaultVariants: { gap: "md" },
})

const cellVariants = cva(
  [
    "rounded-lg border border-[var(--mn-border)]",
    "bg-[var(--mn-surface-raised)] text-[var(--mn-text)]",
    "overflow-hidden transition-shadow duration-200",
  ],
  {
    variants: {
      state: {
        loading: "animate-pulse",
        ready: "",
        empty: "",
        error: "border-[var(--mn-border-error)]",
      },
    },
    defaultVariants: { state: "loading" },
  },
)

/* Helpers */

function clampSpan(value: number | undefined): number {
  if (!value || Number.isNaN(value)) return 1
  return Math.max(1, Math.min(12, Math.round(value)))
}

function resolveWidgetState(data: unknown): WidgetState {
  if (data === undefined || data === null) return "loading"
  if (data instanceof Error) return "error"
  if (Array.isArray(data) && data.length === 0) return "empty"
  return "ready"
}

/* Default placeholders */

function LoadingPlaceholder() {
  return (
    <div className="flex flex-col gap-2 p-4" role="status" aria-live="polite">
      <div className="h-3 w-3/4 rounded bg-[var(--mn-border-subtle)]" />
      <div className="h-3 w-full rounded bg-[var(--mn-border-subtle)]" />
      <div className="h-3 w-1/2 rounded bg-[var(--mn-border-subtle)]" />
      <span className="sr-only">Loading widget</span>
    </div>
  )
}

function EmptyPlaceholder() {
  return (
    <div className="flex items-center justify-center p-6 text-sm text-[var(--mn-text-muted)]">
      No data available
    </div>
  )
}

function ErrorPlaceholder({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 p-6 text-sm"
      role="alert"
    >
      <AlertCircle className="size-5 text-[var(--mn-error)]" />
      <p className="text-[var(--mn-error)]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
            "border border-[var(--mn-border)] bg-[var(--mn-surface)] text-[var(--mn-text-muted)]",
            "transition-colors hover:bg-[var(--mn-hover-bg)]",
            "focus-visible:outline-2 focus-visible:outline-[var(--mn-accent)]",
          )}
        >
          <RefreshCw className="size-3" />
          Retry
        </button>
      )}
    </div>
  )
}

/* Cell */
function RendererCell({ widget, data, renderWidget, onRetry }: {
  widget: RendererWidget; data: unknown
  renderWidget?: RenderWidgetFn; onRetry?: (dataKey: string) => void
}) {
  const span = clampSpan(widget.span)
  const state = resolveWidgetState(data)

  const content = React.useMemo(() => {
    if (renderWidget) return renderWidget(widget, data, state)
    switch (state) {
      case "loading":
        return <LoadingPlaceholder />
      case "empty":
        return <EmptyPlaceholder />
      case "error":
        return (
          <ErrorPlaceholder
            message={data instanceof Error ? data.message : "Widget error"}
            onRetry={onRetry ? () => onRetry(widget.dataKey) : undefined}
          />
        )
      case "ready":
        return (
          <div className="p-4 text-sm">
            <span className="font-medium">{widget.dataKey}</span>
            <span className="ml-1.5 text-xs text-[var(--mn-text-muted)]">
              ({widget.type})
            </span>
          </div>
        )
    }
  }, [widget, data, state, renderWidget, onRetry])

  return (
    <section
      className={cellVariants({ state })}
      style={{ gridColumn: `span ${span} / span ${span}` }}
      data-dashboard-key={widget.dataKey}
      aria-label={`Widget: ${widget.dataKey}`}
    >
      {content}
    </section>
  )
}

/* Row */
function DashboardRow({ row, data, renderWidget, onRetry }: {
  row: RendererRow; data: Record<string, unknown>
  renderWidget?: RenderWidgetFn; onRetry?: (dataKey: string) => void
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {row.columns.map((w) => (
        <RendererCell key={w.dataKey} widget={w} data={data[w.dataKey]} renderWidget={renderWidget} onRetry={onRetry} />
      ))}
    </div>
  )
}

/* Props */
interface MnDashboardRendererProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof rendererVariants> {
  /** Grid schema describing rows and widget columns. */
  schema: RendererSchema
  /** Map of dataKey to widget data. */
  data?: Record<string, unknown>
  /** Custom widget render function. */
  renderWidget?: RenderWidgetFn
  /** Called when a widget retry button is clicked. */
  onRetry?: (dataKey: string) => void
}

/**
 * Config-driven dashboard renderer. Takes a `RendererSchema` and renders
 * widgets in a 12-column grid with automatic state resolution.
 */
function MnDashboardRenderer({
  schema,
  data = {},
  gap,
  renderWidget,
  onRetry,
  className,
  children,
  ...props
}: MnDashboardRendererProps) {
  return (
    <div
      {...props}
      className={cn(rendererVariants({ gap }), className)}
      data-slot="mn-dashboard-renderer"
    >
      {schema.rows.map((row, idx) => (
        <DashboardRow key={idx} row={row} data={data} renderWidget={renderWidget} onRetry={onRetry} />
      ))}
      {children}
    </div>
  )
}

export { MnDashboardRenderer, rendererVariants, cellVariants }
export type {
  MnDashboardRendererProps,
  RendererSchema,
  RendererRow,
  RendererWidget,
  WidgetType,
  WidgetState,
  RenderWidgetFn,
}
