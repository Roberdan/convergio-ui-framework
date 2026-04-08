"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  SIZE_PX, type GaugeSize, readPalette,
  type SubDial, type ArcBar, type InnerRing, type Odometer, type StatusLed, type Trend,
  type Crosshair, type CrosshairScatterDot, type QuadrantCounts, type Multigraph,
  ease, render,
} from "./mn-gauge.helpers"

const gaugeWrap = cva("relative inline-block", {
  variants: { size: { sm: "", md: "", lg: "", fluid: "h-full w-full" } },
  defaultVariants: { size: "md" },
})

export type { SubDial, ArcBar, InnerRing, Odometer, StatusLed, Trend, Crosshair, CrosshairScatterDot, QuadrantCounts, Multigraph }

export interface MnGaugeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, VariantProps<typeof gaugeWrap> {
  value?: number; min?: number; max?: number; unit?: string; label?: string
  ticks?: number; subticks?: number; numbers?: number[]
  startAngle?: number; endAngle?: number; color?: string
  arcBar?: ArcBar; subDials?: SubDial[]; innerRing?: InnerRing
  odometer?: Odometer; statusLed?: StatusLed; trend?: Trend
  crosshair?: Crosshair; quadrantCounts?: QuadrantCounts; multigraph?: Multigraph
  centerValue?: string; centerUnit?: string
  animate?: boolean
}

function MnGauge({
  value = 0, min = 0, max = 100, unit, label, ticks = 10, subticks = 5, numbers,
  startAngle = -135, endAngle = 135, color, arcBar, subDials,
  innerRing, odometer, statusLed, trend,
  crosshair, quadrantCounts, multigraph, centerValue, centerUnit,
  animate = true, size = "md", className, ...rest
}: MnGaugeProps) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)

  const px = React.useCallback((): number => {
    if (size === "fluid") { const r = wrap.current?.getBoundingClientRect(); return r ? Math.min(r.width, r.height) || SIZE_PX.md : SIZE_PX.md }
    return SIZE_PX[size as keyof typeof SIZE_PX] ?? SIZE_PX.md
  }, [size])

  React.useEffect(() => {
    cancelAnimationFrame(raf.current)
    const s = px(); if (!cvs.current || !wrap.current) return
    const pal = readPalette(wrap.current)
    const effectiveColor = color ?? pal.accent
    const go = (p: number) => { if (!cvs.current) return; render(cvs.current, pal, s, p, value, min, max, startAngle, endAngle, ticks, subticks, numbers, effectiveColor, unit, label, arcBar, subDials, innerRing, odometer, statusLed, trend, crosshair, quadrantCounts, multigraph, centerValue, centerUnit) }
    if (!animate) { go(1); return }
    const dur = 1400, t0 = performance.now()
    const tick = (now: number) => { const p = Math.min(1, (now - t0) / dur); go(ease(p)); if (p < 1) raf.current = requestAnimationFrame(tick) }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, min, max, unit, label, ticks, subticks, numbers, startAngle, endAngle, color, arcBar, subDials, innerRing, odometer, statusLed, trend, crosshair, quadrantCounts, multigraph, centerValue, centerUnit, animate, px])

  React.useEffect(() => {
    if (size !== "fluid" || typeof ResizeObserver === "undefined") return
    let tid: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => { clearTimeout(tid); tid = setTimeout(() => { const s = px(); if (s > 0 && cvs.current && wrap.current) { const p = readPalette(wrap.current); render(cvs.current, p, s, 1, value, min, max, startAngle, endAngle, ticks, subticks, numbers, color ?? p.accent, unit, label, arcBar, subDials, innerRing, odometer, statusLed, trend, crosshair, quadrantCounts, multigraph, centerValue, centerUnit) } }, 150) })
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [size, value, min, max, unit, label, ticks, subticks, numbers, startAngle, endAngle, color, arcBar, subDials, innerRing, odometer, statusLed, trend, crosshair, quadrantCounts, multigraph, centerValue, centerUnit, px])

  return (
    <div ref={wrap} role="meter" aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
      aria-label={label ?? `Gauge: ${value}${unit ?? ""}`}
      className={cn(gaugeWrap({ size: size as GaugeSize }), className)} {...rest}>
      <canvas ref={cvs} className="block" />
      <div className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 35%, var(--mn-hover-bg, rgba(255,255,255,0.06)) 0%, transparent 100%)" }} />
    </div>
  )
}

export { MnGauge, gaugeWrap }
