"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────────── */

export interface BulletRange {
  label?: string
  min: number
  max: number
  color?: string
}

export interface MnBulletChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof bulletChartVariants> {
  value: number
  target: number
  max: number
  label?: string
  unit?: string
  ranges?: BulletRange[]
  trackHeight?: number
  animate?: boolean
}

const bulletChartVariants = cva("relative inline-block", {
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

/* ── Helpers ───────────────────────────────────────────────── */

function resolveCssVar(name: string): string {
  if (typeof document === "undefined") return "#888"
  return getComputedStyle(document.body ?? document.documentElement).getPropertyValue(name).trim() || "#888"
}

function parseColor(c: string): string {
  return c.startsWith("var(") ? resolveCssVar(c.slice(4, c.indexOf(")")).split(",")[0].trim()) : c
}

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.trim().replace("#", "")
  if (h.length !== 6 && h.length !== 3) return null
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(f, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function colorAlpha(hex: string, a: number): string {
  const rgb = hexToRgb(hex)
  return rgb ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})` : `rgba(128,128,128,${a})`
}

function easeOutCubic(t: number): number { return 1 - (1 - t) ** 3 }

/* ── Draw pipeline ─────────────────────────────────────────── */

interface RenderOpts {
  value: number; target: number; max: number
  label?: string; unit?: string; ranges?: BulletRange[]; trackHeight: number
}

function render(cvs: HTMLCanvasElement, w: number, opts: RenderOpts, progress: number) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const trackH = opts.trackHeight
  const labelH = opts.label ? 18 : 0
  const totalH = trackH + labelH + 14

  cvs.width = Math.round(w * dpr); cvs.height = Math.round(totalH * dpr)
  cvs.style.width = `${w}px`; cvs.style.height = `${totalH}px`

  const ctx = cvs.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, totalH)

  const borderHex = parseColor("var(--mn-border)")
  const accentHex = parseColor("var(--mn-accent)")
  const textHex = parseColor("var(--mn-text)")
  const mutedHex = parseColor("var(--mn-text-muted)")

  const rightPad = 52
  const trackW = w - rightPad
  const trackY = labelH + 2
  const maxVal = opts.max || 1

  /* Label */
  if (opts.label) {
    ctx.font = "11px system-ui, sans-serif"
    ctx.fillStyle = mutedHex
    ctx.textBaseline = "top"
    ctx.textAlign = "left"
    ctx.fillText(opts.label, 0, 0)
  }

  /* 1 - Qualitative bands (widest first so narrower bands paint over) */
  const bands: BulletRange[] = opts.ranges ?? [
    { min: 0, max: maxVal * 0.4, color: colorAlpha(borderHex, 0.45) },
    { min: 0, max: maxVal * 0.7, color: colorAlpha(borderHex, 0.28) },
    { min: 0, max: maxVal, color: colorAlpha(borderHex, 0.14) },
  ]

  const sorted = [...bands].sort((a, b) => b.max - a.max)
  for (const band of sorted) {
    const bw = Math.min((band.max / maxVal) * trackW, trackW)
    const bx = Math.max(0, (band.min / maxVal) * trackW)
    const color =
      band.color && band.color.startsWith("rgba")
        ? band.color
        : colorAlpha(parseColor(band.color ?? "var(--mn-border)"), 0.3)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(bx, trackY, bw - bx, trackH, 3)
    ctx.fill()
  }

  /* 2 - Value bar: 44% of track height, vertically centered */
  const currentValue = opts.value * progress
  const valBarH = Math.round(trackH * 0.44)
  const valBarY = trackY + Math.round((trackH - valBarH) / 2)
  const valW = Math.max(2, Math.min((currentValue / maxVal) * trackW, trackW))
  ctx.fillStyle = accentHex
  ctx.beginPath()
  ctx.roundRect(0, valBarY, valW, valBarH, 2)
  ctx.fill()

  /* 3 - Target marker: 3px vertical line */
  const targetX = Math.round((opts.target / maxVal) * trackW)
  ctx.fillStyle = textHex
  ctx.fillRect(targetX - 1, trackY, 3, trackH)

  /* 4 - Value label (right of track) */
  const displayVal = Number.isInteger(opts.value)
    ? Math.round(currentValue)
    : currentValue.toFixed(1)
  ctx.font = "bold 11px system-ui, sans-serif"
  ctx.fillStyle = textHex
  ctx.textBaseline = "middle"
  ctx.textAlign = "left"
  ctx.fillText(`${displayVal}${opts.unit ?? ""}`, trackW + 6, trackY + trackH / 2)

  /* 5 - Target value label (below marker) */
  ctx.font = "9px system-ui, sans-serif"
  ctx.fillStyle = mutedHex
  ctx.textAlign = "center"
  ctx.fillText(
    `${opts.target}${opts.unit ?? ""}`,
    targetX,
    trackY + trackH + 10,
  )
}

/* ── Component ─────────────────────────────────────────────── */

function MnBulletChart({
  value,
  target,
  max,
  label,
  unit,
  ranges,
  trackHeight = 32,
  animate = true,
  size = "full",
  className,
  ...rest
}: MnBulletChartProps) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)

  const resolveWidth = React.useCallback((): number => {
    const r = wrap.current?.getBoundingClientRect()
    return r ? r.width || 400 : 400
  }, [])

  const drawOpts = React.useMemo(
    () => ({ value, target, max, label, unit, ranges, trackHeight }),
    [value, target, max, label, unit, ranges, trackHeight],
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

    const dur = 600
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      go(easeOutCubic(p))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [drawOpts, animate, resolveWidth])

  /* Fluid resize */
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

  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const u = unit ?? ""
  const desc = `value ${value}${u}, target ${target}${u} (${pct}% of max)`

  return (
    <div ref={wrap} className={cn(bulletChartVariants({ size }), className)} {...rest}>
      <canvas ref={cvs} role="img" aria-label={label ? `${label}: ${desc}` : `Bullet chart: ${desc}`} className="block" />
    </div>
  )
}

export { MnBulletChart, bulletChartVariants }
