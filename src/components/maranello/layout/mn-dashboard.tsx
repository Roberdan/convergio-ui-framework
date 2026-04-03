"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// --- Types ---

export type DashboardWidgetType =
  | "kpi-strip"
  | "stat-card"
  | "chart"
  | "gauge"
  | "legend"
  | "table-summary"
  | "custom"

export interface DashboardWidget {
  /** Widget renderer type. */
  type: DashboardWidgetType
  /** Unique key used to look up data for this widget. */
  dataKey: string
  /** Number of grid columns to span (1–12). */
  span?: number
  /** Arbitrary options forwarded to the widget renderer. */
  options?: Record<string, unknown>
}

export interface DashboardRow {
  columns: DashboardWidget[]
}

export interface DashboardSchema {
  rows: DashboardRow[]
}

// ---
// CVA variants
// ---

const dashboardVariants = cva("flex flex-col", {
  variants: {
    gap: { none: "gap-0", sm: "gap-2", md: "gap-4", lg: "gap-6" },
  },
  defaultVariants: { gap: "md" },
})

const cellVariants = cva(
  "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      interactive: {
        true: "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  },
)

// ---
// Helpers
// ---

function clampSpan(value: number | undefined): number {
  if (!value || Number.isNaN(value)) return 1
  return Math.max(1, Math.min(12, Math.round(value)))
}

// ---
// Props
// ---

export interface MnDashboardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dashboardVariants> {
  /** Grid schema describing rows and widget columns. */
  schema: DashboardSchema
  /** Map of dataKey → data values supplied to widget renderers. */
  data?: Record<string, unknown>
  /** Called when a widget cell is clicked. */
  onWidgetClick?: (dataKey: string, data: unknown) => void
  /**
   * Render function for individual widget cells.
   * Receives the widget definition and its data.
   */
  renderWidget?: (
    widget: DashboardWidget,
    data: unknown,
  ) => React.ReactNode
}

// ---
// Sub-components
// ---

function DashboardCell({
  widget,
  data,
  onWidgetClick,
  renderWidget,
}: {
  widget: DashboardWidget
  data: unknown
  onWidgetClick?: (dataKey: string, data: unknown) => void
  renderWidget?: (widget: DashboardWidget, data: unknown) => React.ReactNode
}) {
  const span = clampSpan(widget.span)
  const isInteractive = !!onWidgetClick

  const handleClick = React.useCallback(() => {
    onWidgetClick?.(widget.dataKey, data)
  }, [onWidgetClick, widget.dataKey, data])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (isInteractive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        handleClick()
      }
    },
    [isInteractive, handleClick],
  )

  return (
    <section
      className={cellVariants({ interactive: isInteractive })}
      style={{ gridColumn: `span ${span} / span ${span}` }}
      data-dashboard-key={widget.dataKey}
      {...(isInteractive
        ? {
            role: "button",
            tabIndex: 0,
            onClick: handleClick,
            onKeyDown: handleKeyDown,
          }
        : {})}
    >
      <div className="p-4">
        {renderWidget ? (
          renderWidget(widget, data)
        ) : (
          <DefaultWidgetPlaceholder widget={widget} data={data} />
        )}
      </div>
    </section>
  )
}

function DefaultWidgetPlaceholder({
  widget,
  data,
}: {
  widget: DashboardWidget
  data: unknown
}) {
  if (data === undefined || data === null) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (data instanceof Error) {
    return (
      <div
        className="flex items-center justify-center py-6 text-sm text-destructive"
        role="alert"
      >
        {data.message || "Widget failed to load."}
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{widget.dataKey}</span>
      <span className="ml-1.5 text-xs opacity-60">({widget.type})</span>
    </div>
  )
}

function DashboardRowComponent({
  row,
  data,
  onWidgetClick,
  renderWidget,
}: {
  row: DashboardRow
  data: Record<string, unknown>
  onWidgetClick?: (dataKey: string, data: unknown) => void
  renderWidget?: (widget: DashboardWidget, data: unknown) => React.ReactNode
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {row.columns.map((widget) => (
        <DashboardCell
          key={widget.dataKey}
          widget={widget}
          data={data[widget.dataKey]}
          onWidgetClick={onWidgetClick}
          renderWidget={renderWidget}
        />
      ))}
    </div>
  )
}

// ---
// Component
// ---

/**
 * `MnDashboard` is a schema-driven grid layout container for dashboard widgets.
 * It renders rows of widget cells based on a `DashboardSchema`, maps data by
 * `dataKey`, and delegates rendering to a `renderWidget` prop or shows a
 * default placeholder.
 */
export function MnDashboard({
  schema,
  data = {},
  gap,
  onWidgetClick,
  renderWidget,
  className,
  children,
  ...props
}: MnDashboardProps) {
  return (
    <div
      {...props}
      className={cn(dashboardVariants({ gap }), className)}
    >
      {schema.rows.map((row, idx) => (
        <DashboardRowComponent
          key={idx}
          row={row}
          data={data}
          onWidgetClick={onWidgetClick}
          renderWidget={renderWidget}
        />
      ))}
      {children}
    </div>
  )
}
