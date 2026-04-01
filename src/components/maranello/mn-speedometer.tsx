"use client"

import { useEffect, useMemo, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const FONT = "'Barlow Condensed', 'Outfit', sans-serif"
const SWEEP = Math.PI * 1.5
const START = Math.PI * 0.75
const SIZES: Record<string, number> = { sm: 120, md: 180, lg: 240 }
const ANIM_MS = 800

function easeOut(t: number) { return 1 - (1 - t) ** 3 }
function v2a(v: number, max: number) { return START + (Math.min(Math.max(v, 0), max) / max) * SWEEP }

function cssv(el: Element, n: string, fb: string) {
  return getComputedStyle(el).getPropertyValue(n).trim() || fb
}

function readPalette(el: Element) {
  const g = (n: string, fb: string) => cssv(el, n, fb)
  return {
    bg: [g("--mn-surface", "#0d0d0d"), g("--mn-surface-raised", "#1a1a1a"), g("--mn-border", "#2c2c2c")],
    border: g("--mn-border", "#3a3a3a"), minor: g("--mn-text-muted", "#444"),
    major: g("--mn-text-secondary", "#aaa"), majTxt: g("--mn-text-secondary", "#c8c8c8"),
    capFill: g("--mn-surface-raised", "#2a2a2a"), capStroke: g("--mn-text-muted", "#555"),
    val: g("--mn-text", "#fafafa"), unit: g("--mn-text-muted", "#888"),
    needle: g("--mn-accent", "#DC0000"), arc: g("--mn-accent", "#DC0000"),
  }
}

type Palette = ReturnType<typeof readPalette>

// ---------------------------------------------------------------------------
// Canvas draw — single-frame speedometer render
// ---------------------------------------------------------------------------

function drawFrame(
  ctx: CanvasRenderingContext2D, dim: number, angle: number, val: number,
  max: number, unit: string, ticks: number[], minorN: number, p: Palette,
) {
  const sc = dim / 220, cx = dim / 2, cy = dim / 2, R = dim * 0.4
  ctx.save()
  ctx.clearRect(0, 0, dim, dim)

  // Background
  const bg = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.15)
  bg.addColorStop(0, p.bg[0]); bg.addColorStop(0.82, p.bg[1]); bg.addColorStop(1, p.bg[2])
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2)
  ctx.fillStyle = bg; ctx.fill()
  ctx.strokeStyle = p.border; ctx.lineWidth = 1.5 * sc; ctx.stroke()

  // Value arc
  if (val > 0) {
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.03, v2a(0, max), v2a(val, max))
    ctx.strokeStyle = p.arc; ctx.lineWidth = 4 * sc; ctx.lineCap = "round"
    ctx.globalAlpha = 0.85; ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = "butt"
  }

  // Minor ticks
  const tOut = R * 0.95, total = (ticks.length - 1) * (minorN + 1)
  ctx.strokeStyle = p.minor; ctx.lineWidth = sc
  for (let i = 0; i <= total; i++) {
    const mv = (i / total) * max
    if (ticks.includes(Math.round(mv))) continue
    const a = v2a(mv, max)
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * tOut, cy + Math.sin(a) * tOut)
    ctx.lineTo(cx + Math.cos(a) * (tOut - 6 * sc), cy + Math.sin(a) * (tOut - 6 * sc))
    ctx.stroke()
  }

  // Major ticks + labels
  ctx.strokeStyle = p.major; ctx.lineWidth = 2.5 * sc; ctx.fillStyle = p.majTxt
  ctx.font = `bold ${Math.round(11 * sc)}px ${FONT}`
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  for (const tv of ticks) {
    const a = v2a(tv, max), co = Math.cos(a), sn = Math.sin(a)
    ctx.beginPath()
    ctx.moveTo(cx + co * tOut, cy + sn * tOut)
    ctx.lineTo(cx + co * (tOut - 12 * sc), cy + sn * (tOut - 12 * sc))
    ctx.stroke()
    ctx.fillText(String(tv), cx + co * (tOut - 22 * sc), cy + sn * (tOut - 22 * sc))
  }

  // Needle
  const nLen = R * 0.78, nTail = R * 0.18, nW = 4 * sc
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle)
  ctx.beginPath(); ctx.moveTo(nLen, 0); ctx.lineTo(-nTail, -nW); ctx.lineTo(-nTail, nW); ctx.closePath()
  ctx.fillStyle = p.needle; ctx.shadowColor = p.needle; ctx.shadowBlur = 8 * sc
  ctx.fill(); ctx.shadowBlur = 0; ctx.restore()

  // Center cap
  ctx.beginPath(); ctx.arc(cx, cy, 6 * sc, 0, Math.PI * 2)
  ctx.fillStyle = p.capFill; ctx.fill()
  ctx.strokeStyle = p.capStroke; ctx.lineWidth = 1.5 * sc; ctx.stroke()

  // Value + unit text
  ctx.fillStyle = p.val
  ctx.font = `bold ${Math.round(32 * sc)}px ${FONT}`
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  ctx.fillText(String(Math.round(val)), cx, cy + 20 * sc)
  ctx.fillStyle = p.unit; ctx.font = `${Math.round(11 * sc)}px ${FONT}`
  ctx.fillText(unit, cx, cy + 37 * sc)
  ctx.restore()
}

function autoTicks(min: number, max: number): number[] {
  const step = Math.ceil((max - min) / 5 / 10) * 10 || 1
  const r: number[] = []
  for (let v = min; v <= max; v += step) r.push(v)
  if (r[r.length - 1] !== max) r.push(max)
  return r
}

// ---------------------------------------------------------------------------
// CVA / Props
// ---------------------------------------------------------------------------

const mnSpeedometerVariants = cva("inline-block", {
  variants: { size: { sm: "", md: "", lg: "" } },
  defaultVariants: { size: "md" },
})

export interface MnSpeedometerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof mnSpeedometerVariants> {
  value?: number
  min?: number
  max?: number
  unit?: string
  ticks?: number[]
  minorTicks?: number
  animate?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Canvas 2D speedometer gauge with animated needle, tick marks, numeric
 * labels, and configurable min/max/value. Ported from `<mn-speedometer>`.
 */
export function MnSpeedometer({
  value = 0, min = 0, max = 320, unit = "km/h",
  ticks: ticksProp, minorTicks = 4, animate = true,
  size = "md", className, ...props
}: MnSpeedometerProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const st = useRef({ angle: START, val: 0, raf: 0 })

  const ticksKey = ticksProp ? ticksProp.join(",") : `${min}-${max}`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ticks = useMemo(() => ticksProp ?? autoTicks(min, max), [ticksKey])
  const dim = SIZES[size ?? "md"] ?? 220

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = dim * dpr; canvas.height = dim * dpr
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const p = readPalette(wrap)
    const s = st.current
    const target = Math.min(Math.max(value, min), max)
    const targetA = v2a(target, max)

    if (!animate) {
      s.angle = targetA; s.val = target
      drawFrame(ctx, dim, s.angle, s.val, max, unit, ticks, minorTicks, p)
      return
    }
    if (s.raf) cancelAnimationFrame(s.raf)
    const fA = s.angle, fV = s.val, t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ANIM_MS), e = easeOut(t)
      s.angle = fA + (targetA - fA) * e; s.val = fV + (target - fV) * e
      drawFrame(ctx, dim, s.angle, s.val, max, unit, ticks, minorTicks, p)
      if (t < 1) s.raf = requestAnimationFrame(tick); else s.raf = 0
    }
    s.raf = requestAnimationFrame(tick)
    return () => { if (s.raf) { cancelAnimationFrame(s.raf); s.raf = 0 } }
  }, [value, max, min, unit, dim, animate, ticks, minorTicks])

  // Redraw on container resize (theme/DPR changes)
  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current
    if (!wrap || !canvas) return
    const obs = new ResizeObserver(() => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = dim * dpr; canvas.height = dim * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawFrame(ctx, dim, st.current.angle, st.current.val, max, unit, ticks, minorTicks, readPalette(wrap))
    })
    obs.observe(wrap)
    return () => obs.disconnect()
  }, [dim, max, unit, ticks, minorTicks])

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
