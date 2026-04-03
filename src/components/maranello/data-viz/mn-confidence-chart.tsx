"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { type DrawOpts, render, easeOutCubic } from "./mn-confidence-chart.helpers"

/* ── Types ─────────────────────────────────────────────────── */

export interface MnConfidenceChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof confidenceChartVariants> {
  labels: string[]
  values: number[]
  lower: number[]
  upper: number[]
  unit?: string
  color?: string
  showDots?: boolean
  animate?: boolean
  height?: number
}

const confidenceChartVariants = cva("relative inline-block", {
  variants: {
    size: {
      sm: "max-w-xs",
      md: "max-w-md",
      lg: "max-w-lg",
      full: "w-full",
    },
  },
  defaultVariants: { size: "full" },
})

/* ── Component ─────────────────────────────────────────────── */

function MnConfidenceChart({
  labels,
  values,
  lower,
  upper,
  unit = "",
  color = "var(--mn-accent)",
  showDots = true,
  animate = true,
  height = 200,
  size = "full",
  className,
  ...rest
}: MnConfidenceChartProps) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)

  const resolveWidth = React.useCallback((): number => {
    const r = wrap.current?.getBoundingClientRect()
    return r ? r.width || 600 : 600
  }, [])

  const drawOpts: DrawOpts = React.useMemo(
    () => ({ labels, values, lower, upper, unit, lineColor: color, showDots, height }),
    [labels, values, lower, upper, unit, color, showDots, height],
  )

  React.useEffect(() => {
    cancelAnimationFrame(raf.current)
    const w = resolveWidth()
    if (!cvs.current) return

    const go = (p: number) => render(cvs.current!, w, drawOpts, p)

    if (!animate) {
      go(1)
      return
    }

    const dur = 500
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      go(easeOutCubic(p))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [drawOpts, animate, resolveWidth])

  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined") return
    let tid: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => {
      clearTimeout(tid)
      tid = setTimeout(() => {
        const w = resolveWidth()
        if (w > 0 && cvs.current) render(cvs.current, w, drawOpts, 1)
      }, 150)
    })
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [drawOpts, resolveWidth])

  const n = labels.length
  const dataMin = n > 0 ? Math.min(...lower) : 0
  const dataMax = n > 0 ? Math.max(...upper) : 0
  const trend =
    n >= 2 && values[n - 1] >= values[0] ? "upward" : "downward"
  const ariaLabel = `Confidence chart: ${n} points, range ${dataMin}${unit} to ${dataMax}${unit}, ${trend} trend`

  return (
    <div
      ref={wrap}
      className={cn(confidenceChartVariants({ size }), className)}
      {...rest}
    >
      <canvas
        ref={cvs}
        role="img"
        aria-label={ariaLabel}
        className="block"
      />
    </div>
  )
}

export { MnConfidenceChart, confidenceChartVariants }
