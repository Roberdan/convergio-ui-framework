"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Sizing ────────────────────────────────────────────────── */
const SIZE_PX = { sm: 120, md: 200, lg: 280 } as const
type HalfGaugeSize = keyof typeof SIZE_PX | "fluid"

const halfGaugeWrap = cva("relative inline-block", {
  variants: { size: { sm: "", md: "", lg: "", fluid: "h-full w-full" } },
  defaultVariants: { size: "md" },
})

/* ── Palette (CSS-var aware) ───────────────────────────────── */
const P = {
  track: "rgba(200,200,200,0.08)",
  minMax: "#616161",
}

export interface HalfGaugeColorStop {
  stop: number
  color: string
}

/* ── Types ─────────────────────────────────────────────────── */
export interface MnHalfGaugeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof halfGaugeWrap> {
  value?: number
  min?: number
  max?: number
  unit?: string
  label?: string
  colors?: HalfGaugeColorStop[]
  trackColor?: string
  thickness?: number
  animate?: boolean
}

/* ── Helpers ───────────────────────────────────────────────── */
const ease = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2

const DEFAULT_COLORS: HalfGaugeColorStop[] = [
  { stop: 0, color: "var(--signal-danger, #DC0000)" },
  { stop: 0.5, color: "var(--signal-warning, #FFC72C)" },
  { stop: 1, color: "var(--signal-ok, #00A651)" },
]

/* ── Draw pipeline ─────────────────────────────────────────── */
function render(
  cvs: HTMLCanvasElement,
  w: number,
  prog: number,
  value: number,
  min: number,
  max: number,
  colors: HalfGaugeColorStop[],
  trackColor: string,
  thickness: number,
  unit?: string,
  label?: string,
) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const h = Math.round(w * 0.6)
  cvs.width = w * dpr; cvs.height = h * dpr
  cvs.style.width = `${w}px`; cvs.style.height = `${h}px`
  const ctx = cvs.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h)

  const cx = w / 2, cy = h - 10
  const radius = Math.max(0, Math.min(w / 2, h) - 16), lineW = radius * thickness
  if (radius < 1) return
  const startA = Math.PI, range = max - min || 1
  const pct = Math.max(0, Math.min(1, (value - min) / range)) * prog

  // Track
  ctx.beginPath(); ctx.arc(cx, cy, radius, startA, Math.PI * 2)
  ctx.strokeStyle = trackColor; ctx.lineWidth = lineW; ctx.lineCap = "round"; ctx.stroke()

  // Active arc
  if (pct > 0) {
    const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy)
    const resolved = colors.map((c) => {
      if (!c.color.startsWith("var(")) return c
      const match = c.color.match(/var\(([^,)]+),?\s*([^)]*)\)/)
      if (!match) return c
      const val =
        getComputedStyle(document.documentElement)
          .getPropertyValue(match[1])
          .trim() || match[2]
      return { ...c, color: val }
    })
    resolved.forEach((c) => grad.addColorStop(c.stop, c.color))
    ctx.beginPath(); ctx.arc(cx, cy, radius, startA, startA + pct * Math.PI)
    ctx.strokeStyle = grad; ctx.lineWidth = lineW; ctx.lineCap = "round"; ctx.stroke()
    // Glow
    const glowIdx = Math.floor(pct * (resolved.length - 1))
    ctx.shadowColor = resolved[glowIdx].color; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0
  }

  // Min / max labels
  ctx.fillStyle = P.minMax
  const resolvedFont = typeof document !== "undefined"
    ? getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "Outfit" : "Outfit"
  ctx.font = `500 ${radius * 0.1}px ${resolvedFont}, sans-serif`; ctx.textAlign = "center"
  ctx.fillText(String(min), cx - radius + lineW / 2, cy + radius * 0.18)
  ctx.fillText(String(max), cx + radius - lineW / 2, cy + radius * 0.18)

  // Center value
  const currentVal = Math.round(min + (value - min) * prog)
  const valFs = Math.max(14, radius * 0.35)
  ctx.font = `700 ${valFs}px ${resolvedFont}, sans-serif`
  const resolvedValFg = typeof document !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue("--mn-value-fg").trim() || "#fafafa" : "#fafafa"
  ctx.fillStyle = resolvedValFg; ctx.textBaseline = "middle"
  ctx.fillText(`${currentVal}${unit ?? ""}`, cx, cy - radius * 0.35)

  // Label above value
  if (label) {
    ctx.font = `600 ${Math.max(8, radius * 0.12)}px ${resolvedFont}, sans-serif`
    ctx.fillStyle = "#666"; ctx.fillText(label, cx, cy - radius * 0.55)
  }
}

/* ── Component ─────────────────────────────────────────────── */
function MnHalfGauge({
  value = 0,
  min = 0,
  max = 100,
  unit,
  label,
  colors = DEFAULT_COLORS,
  trackColor = P.track,
  thickness = 0.18,
  animate = true,
  size = "md",
  className,
  ...rest
}: MnHalfGaugeProps) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)

  const pw = React.useCallback((): number => {
    if (size === "fluid") {
      const r = wrap.current?.getBoundingClientRect()
      return r ? r.width || SIZE_PX.md : SIZE_PX.md
    }
    return SIZE_PX[size as keyof typeof SIZE_PX] ?? SIZE_PX.md
  }, [size])

  // Main draw effect
  React.useEffect(() => {
    cancelAnimationFrame(raf.current)
    const w = pw()
    if (!cvs.current) return
    const go = (p: number) =>
      render(cvs.current!, w, p, value, min, max, colors, trackColor, thickness, unit, label)
    if (!animate) { go(1); return }
    const dur = 1200
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      go(ease(p))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, min, max, unit, label, colors, trackColor, thickness, animate, pw])

  // Fluid resize
  React.useEffect(() => {
    if (size !== "fluid" || typeof ResizeObserver === "undefined") return
    let tid: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => {
      clearTimeout(tid)
      tid = setTimeout(() => {
        const w = pw()
        if (w > 0 && cvs.current)
          render(cvs.current, w, 1, value, min, max, colors, trackColor, thickness, unit, label)
      }, 150)
    })
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [size, value, min, max, unit, label, colors, trackColor, thickness, pw])

  const unitSuffix = unit ? ` ${unit}` : ""
  const fillPct = Math.round(((value - min) / (max - min || 1)) * 100)

  return (
    <div
      ref={wrap}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label ?? `Gauge: ${value}${unitSuffix}`}
      className={cn(halfGaugeWrap({ size: size as HalfGaugeSize }), className)}
      {...rest}
    >
      <canvas ref={cvs} role="img" aria-label={`Half gauge: ${value} of ${max}${unitSuffix}, ${fillPct}% fill`} className="block" />
    </div>
  )
}

export { MnHalfGauge, halfGaugeWrap }
