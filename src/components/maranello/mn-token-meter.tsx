"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Formatters ────────────────────────────────────────────── */
const NUM_FMT = new Intl.NumberFormat("en-US")
const COST_FMT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
})

/* ── Types ─────────────────────────────────────────────────── */
export interface TokenUsage {
  prompt: number
  completion: number
  cached?: number
  budget?: number
  costPerMToken?: number
}

export interface MnTokenMeterProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof tokenMeterWrap> {
  usage?: TokenUsage
  label?: string
  showCost?: boolean
  showBreakdown?: boolean
  animate?: boolean
}

/* ── CVA variants ──────────────────────────────────────────── */
const tokenMeterWrap = cva("flex flex-col gap-1.5", {
  variants: {
    size: {
      sm: "max-w-60 text-xs",
      md: "max-w-sm text-sm",
      lg: "max-w-lg text-sm",
    },
  },
  defaultVariants: { size: "md" },
})

/* ── Helpers ───────────────────────────────────────────────── */
function pct(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0
}

function costStr(usage: TokenUsage): string {
  if (!usage.costPerMToken) return ""
  const total = usage.prompt + usage.completion
  return COST_FMT.format((total / 1_000_000) * usage.costPerMToken)
}

/* ── Breakdown row descriptor ──────────────────────────────── */
interface BreakdownRow {
  kind: "prompt" | "completion" | "cached"
  label: string
  value: number
}

const SWATCH_CLASSES: Record<BreakdownRow["kind"], string> = {
  prompt: "bg-[var(--mn-token-prompt,var(--chart-1))]",
  completion: "bg-[var(--mn-token-completion,var(--chart-2))]",
  cached: "bg-[var(--mn-token-cached,var(--chart-3))]",
}

/* ── Component ─────────────────────────────────────────────── */
function MnTokenMeter({
  usage,
  label = "Token Usage",
  showCost,
  showBreakdown = true,
  animate = true,
  size = "md",
  className,
  ...rest
}: MnTokenMeterProps) {
  const data = usage ?? { prompt: 0, completion: 0 }
  const total = data.prompt + data.completion
  const max = data.budget ?? total
  const resolvedShowCost = showCost ?? data.costPerMToken !== undefined

  const promptWidth = pct(data.prompt, max)
  const completionWidth = pct(data.completion, max)
  const cachedWidth = data.cached ? pct(data.cached, data.prompt) : 0

  const prompt = data.prompt
  const completion = data.completion
  const cached = data.cached

  const rows: BreakdownRow[] = [
    { kind: "prompt", label: "Prompt", value: prompt },
    { kind: "completion", label: "Completion", value: completion },
    ...(cached !== undefined && cached > 0
      ? [{ kind: "cached" as const, label: "Cached", value: cached }]
      : []),
  ]

  const barLabel = `Token usage: ${NUM_FMT.format(total)} of ${NUM_FMT.format(max)}`
  const transitionStyle = animate
    ? "transition-[width] duration-500 ease-out"
    : ""

  return (
    <div
      className={cn(tokenMeterWrap({ size }), className)}
      {...rest}
    >
      {/* Header */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-[var(--mn-text,var(--foreground))]">
          {label}
        </span>
        {resolvedShowCost && data.costPerMToken ? (
          <span className="tabular-nums text-[var(--mn-text-muted,var(--muted-foreground))]">
            {costStr(data)}
          </span>
        ) : null}
      </div>

      {/* Bar */}
      <div
        role="meter"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={barLabel}
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--mn-border-subtle,var(--border))]"
      >
        {/* Prompt segment */}
        <div
          className={cn(
            "relative bg-[var(--mn-token-prompt,var(--chart-1))]",
            transitionStyle,
          )}
          style={{ width: `${promptWidth.toFixed(2)}%` }}
        >
          {cachedWidth > 0 && (
            <div
              className={cn(
                "absolute inset-y-0 left-0 bg-[var(--mn-token-cached,var(--chart-3))] opacity-60",
                transitionStyle,
              )}
              style={{ width: `${cachedWidth.toFixed(2)}%` }}
            />
          )}
        </div>

        {/* Completion segment */}
        <div
          className={cn(
            "bg-[var(--mn-token-completion,var(--chart-2))]",
            transitionStyle,
          )}
          style={{ width: `${completionWidth.toFixed(2)}%` }}
        />
      </div>

      {/* Breakdown legend */}
      {showBreakdown && (
        <div
          className="grid gap-x-3 gap-y-1"
          style={{ gridTemplateColumns: "auto 1fr auto auto" }}
          role="list"
          aria-label="Token breakdown"
        >
          {rows.map((row) => (
            <React.Fragment key={row.kind}>
              <span
                className={cn(
                  "mt-1 inline-block size-2.5 rounded-sm",
                  SWATCH_CLASSES[row.kind],
                )}
                role="listitem"
                aria-hidden="true"
              />
              <span className="text-[var(--mn-text-muted,var(--muted-foreground))]">
                {row.label}
              </span>
              <span className="tabular-nums font-medium text-[var(--mn-text,var(--foreground))]">
                {NUM_FMT.format(row.value)}
              </span>
              <span className="tabular-nums text-[var(--mn-text-muted,var(--muted-foreground))]">
                {total > 0 ? pct(row.value, total).toFixed(1) : "0.0"}%
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export { MnTokenMeter, tokenMeterWrap }
export type { BreakdownRow }
