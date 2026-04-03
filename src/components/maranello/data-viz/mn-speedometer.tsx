"use client"

import { useEffect, useMemo, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const FONT = "'Barlow Condensed', 'Outfit', sans-serif"
const SWEEP = Math.PI * 1.5
const START = Math.PI * 0.75
const SIZES: Record<string, number> = { sm: 120, md: 220, lg: 320 }
const ANIM_MS = 800

function easeOut(t: number) { return 1 - (1 - t) ** 3 }
function v2a(v: number, max: number) { return START + (Math.min(Math.max(v, 0), max) / max) * SWEEP }

function cssv(el: Element, n: string, fb: string) {
  return getComputedStyle(el).getPropertyValue(n).trim() || fb
}

function readPalette(el: Element) {
  const g = (n: string, fb: string) => cssv(el, n, fb)
  const theme = document.documentElement.getAttribute("data-theme") ?? "navy"
  const lt = theme === "light"
  return {
    bg: [g("--mn-surface", lt ? "#ffffff" : "#0d0d0d"), g("--mn-surface-raised", lt ? "#faf3e6" : "#1a1a1a"), g("--mn-border", lt ? "#d4c4a8" : "#2c2c2c")],
    border: g("--mn-border", lt ? "#b8ad9a" : "#3a3a3a"),
    minorTick: lt ? "#b8ad9a" : g("--mn-text-muted", "#444"),
    majStroke: lt ? "#8a7e6a" : g("--mn-text-secondary", "#aaa"),
    majText: lt ? "#4a3d1a" : g("--mn-text-secondary", "#c8c8c8"),
    capFill: g("--mn-surface-raised", lt ? "#e8dcc8" : "#2a2a2a"),
    capStroke: lt ? "#b8ad9a" : g("--mn-text-muted", "#555"),
    value: lt ? "#1a1206" : g("--mn-text", "#fafafa"),
    unit: lt ? "#5a4a28" : g("--mn-text-muted", "#888"),
    subLabel: lt ? "#6b5a32" : g("--mn-text-muted", "#666"),
    needle: g("--mn-accent", "#DC0000"),
    arc: g("--mn-accent", "#DC0000"),
    barBg: g("--mn-surface-raised", lt ? "#e8dcc8" : "#1a1a1a"),
    barDim: lt ? "#6b5a32" : g("--mn-text-muted", "#666"),
    barBright: lt ? "#4a3d1a" : g("--mn-text-secondary", "#aaa"),
    barStops: [g("--signal-danger", "#DC0000"), g("--signal-warning", "#FFC72C"), g("--signal-ok", "#00A651")],
  }
}

type Palette = ReturnType<typeof readPalette>
interface BarOptions {
  value?: number; colorStops?: string[]
  label?: string; labelLeft?: string; labelRight?: string
}

function drawFrame(
  ctx: CanvasRenderingContext2D, dim: number, angle: number, val: number,
  max: number, unit: string, ticks: number[], minorN: number, p: Palette,
  arcStart: number, arcEnd: number | null, subLabel: string | null,
  bar: BarOptions | null, barVal: number,
) {
  const s = dim / 220, cx = dim / 2, cy = dim / 2, R = dim * 0.4
  ctx.save()
  ctx.clearRect(0, 0, dim, dim)

  // Background
  const bg = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.15)
  bg.addColorStop(0, p.bg[0]); bg.addColorStop(0.82, p.bg[1]); bg.addColorStop(1, p.bg[2])
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2)
  ctx.fillStyle = bg; ctx.fill()
  ctx.strokeStyle = p.border; ctx.lineWidth = 1.5 * s; ctx.stroke()

  // Value arc
  const aEnd = arcEnd != null ? arcEnd : val
  if (aEnd > arcStart) {
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.03, v2a(arcStart, max), v2a(aEnd, max))
    ctx.strokeStyle = p.arc; ctx.lineWidth = 4 * s; ctx.lineCap = "round"
    ctx.globalAlpha = 0.85; ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = "butt"
  }

  // Minor ticks
  const tOut = R * 0.95, majL = 12 * s, minL = 6 * s
  const total = (ticks.length - 1) * (minorN + 1)
  ctx.strokeStyle = p.minorTick; ctx.lineWidth = s
  for (let i = 0; i <= total; i++) {
    const mv = (i / total) * max
    if (ticks.includes(Math.round(mv))) continue
    const a = v2a(mv, max)
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * tOut, cy + Math.sin(a) * tOut)
    ctx.lineTo(cx + Math.cos(a) * (tOut - minL), cy + Math.sin(a) * (tOut - minL))
    ctx.stroke()
  }

  // Major ticks + labels
  ctx.strokeStyle = p.majStroke; ctx.lineWidth = 2.5 * s; ctx.fillStyle = p.majText
  ctx.font = `bold ${Math.round(11 * s)}px ${FONT}`
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  for (const tv of ticks) {
    const a = v2a(tv, max), co = Math.cos(a), sn = Math.sin(a)
    ctx.beginPath()
    ctx.moveTo(cx + co * tOut, cy + sn * tOut)
    ctx.lineTo(cx + co * (tOut - majL), cy + sn * (tOut - majL))
    ctx.stroke()
    ctx.fillText(String(tv), cx + co * (tOut - majL - 10 * s), cy + sn * (tOut - majL - 10 * s))
  }

  // Needle
  const nLen = R * 0.78, nTail = R * 0.18, nW = 4 * s
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle)
  ctx.beginPath(); ctx.moveTo(nLen, 0); ctx.lineTo(-nTail, -nW); ctx.lineTo(-nTail, nW); ctx.closePath()
  ctx.fillStyle = p.needle; ctx.shadowColor = p.needle; ctx.shadowBlur = 8 * s
  ctx.fill(); ctx.shadowBlur = 0; ctx.restore()

  // Center cap
  ctx.beginPath(); ctx.arc(cx, cy, 6 * s, 0, Math.PI * 2)
  ctx.fillStyle = p.capFill; ctx.fill()
  ctx.strokeStyle = p.capStroke; ctx.lineWidth = 1.5 * s; ctx.stroke()

  // Value + unit text
  ctx.fillStyle = p.value
  ctx.font = `bold ${Math.round(32 * s)}px ${FONT}`
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  ctx.fillText(String(Math.round(val)), cx, cy + 20 * s)
  ctx.fillStyle = p.unit; ctx.font = `${Math.round(11 * s)}px ${FONT}`
  ctx.fillText(unit, cx, cy + 37 * s)
  if (subLabel) {
    ctx.fillStyle = p.subLabel; ctx.font = `${Math.round(9 * s)}px ${FONT}`
    ctx.fillText(subLabel, cx, cy + 50 * s)
  }

  // Bar indicator
  if (bar) {
    const bW = R * 1.2, bH = 6 * s, bR = bH / 2
    const bX = cx - bW / 2, bY = cy + R * 0.72
    const stops = bar.colorStops ?? p.barStops
    ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, bR)
    ctx.fillStyle = p.barBg; ctx.fill()
    const fW = bW * Math.max(0, Math.min(1, barVal))
    if (fW > 1) {
      const gr = ctx.createLinearGradient(bX, 0, bX + bW, 0)
      stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c))
      ctx.save(); ctx.beginPath(); ctx.roundRect(bX, bY, fW, bH, bR)
      ctx.clip(); ctx.fillStyle = gr; ctx.fillRect(bX, bY, bW, bH); ctx.restore()
    }
    ctx.font = `${Math.round(8 * s)}px ${FONT}`; ctx.textBaseline = "top"
    const lY = bY + bH + 3 * s
    if (bar.labelLeft) { ctx.fillStyle = p.barDim; ctx.textAlign = "left"; ctx.fillText(bar.labelLeft, bX, lY) }
    if (bar.labelRight) { ctx.fillStyle = p.barDim; ctx.textAlign = "right"; ctx.fillText(bar.labelRight, bX + bW, lY) }
    if (bar.label) { ctx.fillStyle = p.barBright; ctx.textAlign = "center"; ctx.fillText(bar.label, cx, lY) }
  }

  ctx.restore()
}

function autoTicks(min: number, max: number): number[] {
  const step = Math.ceil((max - min) / 5 / 10) * 10 || 1
  const r: number[] = []
  for (let v = min; v <= max; v += step) r.push(v)
  if (r[r.length - 1] !== max) r.push(max)
  return r
}

const mnSpeedometerVariants = cva("inline-block", {
  variants: { size: { sm: "", md: "", lg: "" } },
  defaultVariants: { size: "md" },
})

export interface MnSpeedometerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof mnSpeedometerVariants> {
  value?: number; min?: number; max?: number; unit?: string
  ticks?: number[]; minorTicks?: number; animate?: boolean
  arcStart?: number; arcEnd?: number | null
  subLabel?: string | null; bar?: BarOptions | null
}

/** Canvas 2D speedometer gauge with animated needle, tick marks, bar indicator,
 *  and configurable min/max/value. Ported from `<mn-speedometer>`. */
export function MnSpeedometer({
  value = 0, min = 0, max = 320, unit = "km/h",
  ticks: ticksProp, minorTicks = 4, animate = true,
  arcStart = 0, arcEnd = null, subLabel = null, bar = null,
  size = "md", className, ...props
}: MnSpeedometerProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const st = useRef({ angle: START, val: 0, raf: 0, barVal: 0 })

  const ticksKey = ticksProp ? ticksProp.join(",") : `${min}-${max}`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ticks = useMemo(() => ticksProp ?? autoTicks(min, max), [ticksKey])
  const dim = SIZES[size ?? "md"] ?? 220
  const barVal = bar?.value ?? 0

  useEffect(() => {
    const cvs = canvasRef.current, wrap = wrapRef.current
    if (!cvs || !wrap) return
    const dpr = window.devicePixelRatio || 1
    cvs.width = dim * dpr; cvs.height = dim * dpr
    const ctx = cvs.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const p = readPalette(wrap), s = st.current
    const target = Math.min(Math.max(value, min), max), targetA = v2a(target, max)
    const render = () => drawFrame(ctx, dim, s.angle, s.val, max, unit, ticks, minorTicks, p, arcStart, arcEnd, subLabel, bar, s.barVal)
    if (!animate) { s.angle = targetA; s.val = target; s.barVal = barVal; render(); return }
    if (s.raf) cancelAnimationFrame(s.raf)
    const fA = s.angle, fV = s.val, fB = s.barVal, t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ANIM_MS), e = easeOut(t)
      s.angle = fA + (targetA - fA) * e; s.val = fV + (target - fV) * e; s.barVal = fB + (barVal - fB) * e
      render()
      if (t < 1) s.raf = requestAnimationFrame(tick); else s.raf = 0
    }
    s.raf = requestAnimationFrame(tick)
    return () => { if (s.raf) { cancelAnimationFrame(s.raf); s.raf = 0 } }
  }, [value, max, min, unit, dim, animate, ticks, minorTicks, arcStart, arcEnd, subLabel, bar, barVal])

  useEffect(() => {
    const wrap = wrapRef.current, cvs = canvasRef.current
    if (!wrap || !cvs) return
    const obs = new ResizeObserver(() => {
      const ctx = cvs.getContext("2d")
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      cvs.width = dim * dpr; cvs.height = dim * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const s = st.current
      drawFrame(ctx, dim, s.angle, s.val, max, unit, ticks, minorTicks, readPalette(wrap), arcStart, arcEnd, subLabel, bar, s.barVal)
    })
    obs.observe(wrap)
    return () => obs.disconnect()
  }, [dim, max, unit, ticks, minorTicks, arcStart, arcEnd, subLabel, bar])

  return (
    <div
      ref={wrapRef} role="meter"
      aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
      aria-label={`Speedometer: ${Math.round(value)}${unit ? ` ${unit}` : ""} of ${max}`}
      {...props}
      className={cn(mnSpeedometerVariants({ size }), className)}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: dim, height: dim }} />
    </div>
  )
}

export { mnSpeedometerVariants }
