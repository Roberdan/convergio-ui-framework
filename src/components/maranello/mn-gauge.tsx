"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const SIZE_PX = { sm: 120, md: 180, lg: 240 } as const
type GaugeSize = keyof typeof SIZE_PX | "fluid"

const gaugeWrap = cva("relative inline-block", {
  variants: { size: { sm: "", md: "", lg: "", fluid: "h-full w-full" } },
  defaultVariants: { size: "md" },
})

/* ── Palette (dark default, matches --mn-* tokens) ─────────── */
const P = {
  tickMajor: "#D4A826", tickHalf: "#9A7B1C", tickMinor: "#5a4a14",
  numbers: "#c8c8c8", centerValue: "#fafafa", centerUnit: "#9e9e9e", centerLabel: "#666",
  muted: "#666", highlightRing: "rgba(255,255,255,0.04)", trackAlpha: "rgba(255,255,255,0.06)",
  needleTail: "#555", needleTip: "#fff", arcDot: "#fff", axisLabel: "#888",
  capOuter: ["#888", "#555", "#333", "#1a1a1a"],
  capInner: ["#aaa", "#666", "#2a2a2a"], capCenter: "#444",
  subDialBg: ["#222", "#111"], subDialBorder: "#3a3a3a", subDialTrack: "rgba(255,255,255,0.08)",
}

/* ── Types ─────────────────────────────────────────────────── */
export interface SubDial { x: number; y: number; value: number; max: number; color: string; label: string }
export interface ArcBar { value: number; max: number; colorStops?: string[]; labelCenter?: string; labelLeft?: string; labelRight?: string }

export interface MnGaugeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, VariantProps<typeof gaugeWrap> {
  value?: number; min?: number; max?: number; unit?: string; label?: string
  ticks?: number; subticks?: number; numbers?: number[]
  startAngle?: number; endAngle?: number; color?: string
  arcBar?: ArcBar; subDials?: SubDial[]; animate?: boolean
}

/* ── Helpers ───────────────────────────────────────────────── */
const R = (d: number) => (d * Math.PI) / 180
const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

function line(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke()
}
function circ(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2)
}

/* ── Draw pipeline ─────────────────────────────────────────── */
function render(
  cvs: HTMLCanvasElement, px: number, prog: number,
  val: number, mn: number, mx: number, sa: number, ea: number,
  tk: number, stk: number, nums: number[] | undefined, color: string,
  unit?: string, lbl?: string, ab?: ArcBar, subs?: SubDial[],
) {
  const ctx = cvs.getContext("2d")!
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  cvs.width = px * dpr; cvs.height = px * dpr
  cvs.style.width = `${px}px`; cvs.style.height = `${px}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const cx = px / 2, cy = px / 2, r = px * 0.40, sw = ea - sa
  const dn = px <= 140 ? "sm" : px <= 260 ? "md" : "lg"
  ctx.clearRect(0, 0, px, px)

  // Frame: shadow ring + vignette
  let g = ctx.createRadialGradient(cx, cy, r * 0.78, cx, cy, r * 1.1)
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(0,0,0,0.4)"); g.addColorStop(1, "rgba(0,0,0,0)")
  circ(ctx, cx, cy, r * 0.94); ctx.strokeStyle = g; ctx.lineWidth = r * 0.28; ctx.stroke()
  g = ctx.createRadialGradient(cx, cy * 0.95, r * 0.1, cx, cy, r * 0.95)
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.85, "rgba(0,0,0,0.15)"); g.addColorStop(1, "rgba(0,0,0,0.4)")
  circ(ctx, cx, cy, r * 0.95); ctx.fillStyle = g; ctx.fill()
  circ(ctx, cx, cy, r * 1.02); ctx.strokeStyle = P.highlightRing; ctx.lineWidth = 1; ctx.stroke()

  // Ticks
  if (tk > 0) {
    const tot = tk * stk
    for (let i = 0; i <= tot; i++) {
      const a = R(sa + (i / tot) * sw), maj = i % stk === 0
      const half = stk > 1 && i % Math.floor(stk / 2) === 0 && !maj
      if (dn === "sm" && !maj && !half) continue
      const [iR, oR, lw, tc] = maj ? [0.70, 0.92, 2.2, P.tickMajor] : half ? [0.78, 0.92, 1, P.tickHalf] : [0.84, 0.92, 0.6, P.tickMinor]
      ctx.strokeStyle = tc; ctx.lineWidth = lw; ctx.lineCap = "butt"
      line(ctx, cx + Math.cos(a) * r * iR, cy + Math.sin(a) * r * iR, cx + Math.cos(a) * r * oR, cy + Math.sin(a) * r * oR)
    }
  }

  // Numbers
  if (nums?.length) {
    const fs = Math.max(8, px * 0.055)
    ctx.font = `500 ${fs}px 'Barlow Condensed','Outfit',sans-serif`
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = P.numbers
    const step = dn === "sm" && nums.length > 5 ? 2 : 1
    nums.forEach((n, i) => { if (step > 1 && i % step !== 0 && i !== nums.length - 1) return; const a = R(sa + (n / (mx - mn)) * sw); ctx.fillText(n.toString(), cx + Math.cos(a) * r * 0.56, cy + Math.sin(a) * r * 0.56) })
  }

  // Arc bar
  if (ab) {
    const ar = r * 0.96
    ctx.beginPath(); ctx.arc(cx, cy, ar, R(sa), R(sa + sw)); ctx.strokeStyle = P.trackAlpha; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke()
    const v = (ab.value / ab.max) * sw * prog, stops = ab.colorStops ?? ["#DC0000", "#FFC72C", "#00A651"], frac = sw / 360
    const cg = ctx.createConicGradient(R(sa), cx, cy)
    stops.forEach((c, i) => cg.addColorStop((i / (stops.length - 1)) * frac, c))
    ctx.beginPath(); ctx.arc(cx, cy, ar, R(sa), R(sa + v)); ctx.strokeStyle = cg; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke()
    const na = R(sa + v); circ(ctx, cx + Math.cos(na) * ar, cy + Math.sin(na) * ar, 3); ctx.fillStyle = P.arcDot; ctx.fill()
    const afs = Math.max(7, px * 0.04)
    if (ab.labelCenter) { ctx.font = `600 ${afs}px 'Barlow Condensed',sans-serif`; ctx.fillStyle = "#00A651"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(ab.labelCenter, cx, cy + r * 0.78) }
    if (ab.labelLeft) { ctx.font = `400 ${Math.max(6, px * 0.03)}px 'Inter',sans-serif`; ctx.fillStyle = P.muted; ctx.textAlign = "left"; ctx.fillText(ab.labelLeft, cx - r * 0.65, cy + r * 0.92) }
    if (ab.labelRight) { ctx.textAlign = "right"; ctx.fillText(ab.labelRight, cx + r * 0.65, cy + r * 0.92) }
  }

  // Needle
  const norm = val - mn, range = mx - mn || 1
  if (tk > 0) {
    const cur = norm * prog, a = R(sa + (cur / range) * sw)
    const len = r * 0.82, tl = r * 0.18, tipX = cx + Math.cos(a) * len, tipY = cy + Math.sin(a) * len
    const pa = a + Math.PI / 2, bw = Math.max(1.8, px * 0.012), tX = cx - Math.cos(a) * tl, tY = cy - Math.sin(a) * tl, tw = bw * 1.5
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 22
    ctx.beginPath(); ctx.moveTo(tipX, tipY)
    ctx.lineTo(cx + Math.cos(pa) * bw, cy + Math.sin(pa) * bw); ctx.lineTo(tX + Math.cos(pa) * tw, tY + Math.sin(pa) * tw)
    ctx.lineTo(tX - Math.cos(pa) * tw, tY - Math.sin(pa) * tw); ctx.lineTo(cx - Math.cos(pa) * bw, cy - Math.sin(pa) * bw); ctx.closePath()
    const ng = ctx.createLinearGradient(tX, tY, tipX, tipY)
    ng.addColorStop(0, P.needleTail); ng.addColorStop(0.3, color); ng.addColorStop(0.85, color); ng.addColorStop(1, P.needleTip)
    ctx.fillStyle = ng; ctx.fill(); ctx.restore()
    // cap
    const cr = r * 0.11
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8; circ(ctx, cx, cy, cr)
    const cg2 = ctx.createRadialGradient(cx - cr * 0.2, cy - cr * 0.3, 0, cx, cy, cr); P.capOuter.forEach((c, i) => cg2.addColorStop(i / 3, c))
    ctx.fillStyle = cg2; ctx.fill(); ctx.restore()
    const cr2 = cr * 0.65, cg3 = ctx.createRadialGradient(cx - cr2 * 0.15, cy - cr2 * 0.2, 0, cx, cy, cr2); P.capInner.forEach((c, i) => cg3.addColorStop(i / 2, c))
    circ(ctx, cx, cy, cr2); ctx.fillStyle = cg3; ctx.fill()
    circ(ctx, cx, cy, cr * 0.2); ctx.fillStyle = P.capCenter; ctx.fill()
  }

  // Center text (when no ticks / pure value display)
  if (!tk) {
    const fs = Math.max(20, px * 0.22)
    ctx.font = `700 ${fs}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = P.centerValue; ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillText(String(Math.round(norm * prog + mn)), cx, cy)
    if (unit) { ctx.font = `500 ${Math.max(8, px * 0.055)}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = P.centerUnit; ctx.fillText(unit, cx, cy + fs * 0.55) }
    if (lbl) { ctx.font = `600 ${Math.max(7, px * 0.045)}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = P.centerLabel; ctx.fillText(lbl, cx, cy - fs * 0.65) }
  }

  // Sub-dials
  if (subs?.length) {
    for (const sd of subs) {
      const sx = cx + sd.x * px, sy = cy + sd.y * px, sr = px * 0.10
      const bg = ctx.createRadialGradient(sx, sy - 1, sr * 0.2, sx, sy, sr); bg.addColorStop(0, P.subDialBg[0]); bg.addColorStop(1, P.subDialBg[1])
      circ(ctx, sx, sy, sr); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = P.subDialBorder; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.beginPath(); ctx.arc(sx, sy, sr * 0.72, R(-225), R(45)); ctx.strokeStyle = P.subDialTrack; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke()
      const sv = (sd.value / sd.max) * 270 * prog
      ctx.beginPath(); ctx.arc(sx, sy, sr * 0.72, R(-225), R(-225 + sv)); ctx.strokeStyle = sd.color; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke()
      ctx.font = `700 ${Math.max(8, sr * 0.55)}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = sd.color; ctx.textAlign = "center"; ctx.textBaseline = "middle"
      ctx.fillText(Math.round(sd.value * prog).toString(), sx, sy - sr * 0.05)
      if (dn !== "sm") { ctx.font = `500 ${Math.max(5, sr * 0.32)}px 'Barlow Condensed',sans-serif`; ctx.fillStyle = P.axisLabel; ctx.fillText(sd.label, sx, sy + sr * 0.45) }
    }
  }
}

/* ── Component ─────────────────────────────────────────────── */
function MnGauge({
  value = 0, min = 0, max = 100, unit, label, ticks = 10, subticks = 5, numbers,
  startAngle = -135, endAngle = 135, color = "#FFC72C", arcBar, subDials,
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
    const s = px(); if (!cvs.current) return
    const go = (p: number) => render(cvs.current!, s, p, value, min, max, startAngle, endAngle, ticks, subticks, numbers, color, unit, label, arcBar, subDials)
    if (!animate) { go(1); return }
    const dur = 1400, t0 = performance.now()
    const tick = (now: number) => { const p = Math.min(1, (now - t0) / dur); go(ease(p)); if (p < 1) raf.current = requestAnimationFrame(tick) }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, min, max, unit, label, ticks, subticks, numbers, startAngle, endAngle, color, arcBar, subDials, animate, px])

  React.useEffect(() => {
    if (size !== "fluid" || typeof ResizeObserver === "undefined") return
    let tid: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => { clearTimeout(tid); tid = setTimeout(() => { const s = px(); if (s > 0 && cvs.current) render(cvs.current, s, 1, value, min, max, startAngle, endAngle, ticks, subticks, numbers, color, unit, label, arcBar, subDials) }, 150) })
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [size, value, min, max, unit, label, ticks, subticks, numbers, startAngle, endAngle, color, arcBar, subDials, px])

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
