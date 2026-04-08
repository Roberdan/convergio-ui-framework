/* ── Constants ─────────────────────────────────────────────── */

export const SIZE_PX = { sm: 120, md: 180, lg: 240 } as const
export type GaugeSize = keyof typeof SIZE_PX | "fluid"

/* ── Types ──────────────────────────────────────────────────── */

export interface SubDial { x: number; y: number; value: number; max: number; color: string; label: string }
export interface ArcBar { value: number; max: number; colorStops?: string[]; labelCenter?: string; labelLeft?: string; labelRight?: string }
export interface InnerRing { value: number; max: number; color: string; label: string }
export interface Odometer { digits: (string | number)[]; highlightLast?: boolean }
export interface StatusLed { color: string; label: string }
export interface Trend { direction: "up" | "down"; delta: string; color: string }

export type { Crosshair, CrosshairScatterDot, QuadrantCounts, Multigraph } from './mn-gauge-crosshair'

/* ── Palette ────────────────────────────────────────────────── */

export function readPalette(el: Element) {
  const g = (n: string, fb: string) => getComputedStyle(el).getPropertyValue(n).trim() || fb
  const theme = document.documentElement.getAttribute("data-theme") ?? "navy"
  const lt = theme === "light"
  const cb = theme === "colorblind"
  return {
    tickMajor: lt ? "#a07818" : cb ? "#FFB000" : "#D4A826", tickHalf: lt ? "#806010" : cb ? "#B87E00" : "#9A7B1C", tickMinor: lt ? "#604808" : cb ? "#7A5400" : "#5a4a14",
    numbers: lt ? "#4a3d1a" : g("--mn-text-tertiary","#c8c8c8"),
    centerValue: lt ? "#1a1206" : g("--mn-text","#fafafa"),
    centerUnit: lt ? "#5a4a28" : g("--mn-text-muted","#9e9e9e"),
    centerLabel: lt ? "#6b5a32" : g("--mn-text-disabled","#666"),
    muted: lt ? "#6b5a32" : g("--mn-text-disabled","#666"), highlightRing: g("--mn-hover-bg", lt ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)"), trackAlpha: g("--mn-border-subtle", lt ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"),
    needleTail: lt ? "#a8a49e" : "#555", needleTip: lt ? "#1a1a1a" : "#fff", arcDot: lt ? "#1a1a1a" : g("--mn-text","#fff"), axisLabel: lt ? "#5a4a28" : g("--mn-text-muted","#888"),
    capOuter: lt ? ["#d0cfc9","#b8b4ae","#a09e98","#888582"] : ["#888","#555","#333","#1a1a1a"],
    capInner: lt ? ["#d8d4ce","#c0bcb6","#a8a49e"] : ["#aaa","#666","#2a2a2a"], capCenter: lt ? "#b0aba4" : "#444",
    subDialBg: lt ? ["#e8e2d6","#d8d2c6"] : [g("--mn-surface-raised","#222"), g("--mn-surface-sunken","#111")],
    subDialBorder: lt ? "#b8b2a6" : g("--mn-border","#3a3a3a"),
    subDialTrack: lt ? "rgba(0,0,0,0.10)" : g("--mn-border-subtle","rgba(255,255,255,0.08)"),
    odometerBg: lt ? "#e0dace" : g("--mn-surface-sunken","#1a1a1a"),
    odometerBorder: lt ? "#b0aaa0" : g("--mn-border","#333"),
    signalDanger: g("--mn-signal-error", "#DC0000"),
    signalWarn: g("--mn-signal-warn", "#FFC72C"),
    signalOk: g("--mn-signal-ok", "#00A651"),
    accent: g("--mn-accent", "#FFC72C"),
  }
}
export type GaugePalette = ReturnType<typeof readPalette>

import { drawCrosshair, drawMultigraph, type Crosshair, type QuadrantCounts, type Multigraph } from './mn-gauge-crosshair'

/* ── Drawing helpers ───────────────────────────────────────── */

export const R = (d: number) => (d * Math.PI) / 180
export const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

function line(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke()
}
function circ(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2)
}

/* ── Render ─────────────────────────────────────────────────── */

export function render(
  cvs: HTMLCanvasElement, pal: GaugePalette, px: number, prog: number,
  val: number, mn: number, mx: number, sa: number, ea: number,
  tk: number, stk: number, nums: number[] | undefined, color: string,
  unit?: string, lbl?: string, ab?: ArcBar, subs?: SubDial[],
  ir?: InnerRing, od?: Odometer, led?: StatusLed, tr?: Trend,
  ch?: Crosshair, qc?: QuadrantCounts, mg?: Multigraph,
  cvOverride?: string, cuOverride?: string,
) {
  const ctx = cvs.getContext("2d")
  if (!ctx) return
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  if (px < 40) return
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
  circ(ctx, cx, cy, r * 1.02); ctx.strokeStyle = pal.highlightRing; ctx.lineWidth = 1; ctx.stroke()

  // Inner ring
  if (ir) {
    const irR = r * 0.48
    ctx.beginPath(); ctx.arc(cx, cy, irR, R(sa), R(sa + sw)); ctx.strokeStyle = pal.trackAlpha; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke()
    const irV = (ir.value / ir.max) * sw * prog
    ctx.beginPath(); ctx.arc(cx, cy, irR, R(sa), R(sa + irV)); ctx.strokeStyle = ir.color; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke()
    ctx.font = `500 ${Math.max(7, px * 0.04)}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = ir.color; ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillText(ir.label, cx, cy + r * 0.50)
  }

  // Ticks
  if (tk > 0) {
    const tot = tk * stk
    for (let i = 0; i <= tot; i++) {
      const a = R(sa + (i / tot) * sw), maj = i % stk === 0
      const half = stk > 1 && i % Math.floor(stk / 2) === 0 && !maj
      if (dn === "sm" && !maj && !half) continue
      const [iR, oR, lw, tc] = maj ? [0.70, 0.92, 2.2, pal.tickMajor] : half ? [0.78, 0.92, 1, pal.tickHalf] : [0.84, 0.92, 0.6, pal.tickMinor]
      ctx.strokeStyle = tc; ctx.lineWidth = lw; ctx.lineCap = "butt"
      line(ctx, cx + Math.cos(a) * r * iR, cy + Math.sin(a) * r * iR, cx + Math.cos(a) * r * oR, cy + Math.sin(a) * r * oR)
    }
  }

  // Numbers
  if (nums?.length) {
    const fs = Math.max(8, px * 0.055)
    ctx.font = `500 ${fs}px 'Barlow Condensed','Outfit',sans-serif`
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = pal.numbers
    const step = dn === "sm" && nums.length > 5 ? 2 : 1
    nums.forEach((n, i) => { if (step > 1 && i % step !== 0 && i !== nums.length - 1) return; const a = R(sa + (n / (mx - mn)) * sw); ctx.fillText(n.toString(), cx + Math.cos(a) * r * 0.56, cy + Math.sin(a) * r * 0.56) })
  }

  // Arc bar
  if (ab) {
    const ar = r * 0.96
    ctx.beginPath(); ctx.arc(cx, cy, ar, R(sa), R(sa + sw)); ctx.strokeStyle = pal.trackAlpha; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke()
    const v = (ab.value / ab.max) * sw * prog, stops = ab.colorStops ?? [pal.signalDanger, pal.signalWarn, pal.signalOk], frac = sw / 360
    const cg = ctx.createConicGradient(R(sa), cx, cy)
    stops.forEach((c, i) => cg.addColorStop((i / (stops.length - 1)) * frac, c))
    ctx.beginPath(); ctx.arc(cx, cy, ar, R(sa), R(sa + v)); ctx.strokeStyle = cg; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke()
    const na = R(sa + v); circ(ctx, cx + Math.cos(na) * ar, cy + Math.sin(na) * ar, 3); ctx.fillStyle = pal.arcDot; ctx.fill()
    const afs = Math.max(7, px * 0.04)
    if (ab.labelCenter) { ctx.font = `600 ${afs}px 'Barlow Condensed',sans-serif`; ctx.fillStyle = pal.signalOk; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(ab.labelCenter, cx, cy + r * 0.78) }
    if (ab.labelLeft) { ctx.font = `400 ${Math.max(6, px * 0.03)}px 'Inter',sans-serif`; ctx.fillStyle = pal.muted; ctx.textAlign = "left"; ctx.fillText(ab.labelLeft, cx - r * 0.65, cy + r * 0.92) }
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
    ng.addColorStop(0, pal.needleTail); ng.addColorStop(0.3, color); ng.addColorStop(0.85, color); ng.addColorStop(1, pal.needleTip)
    ctx.fillStyle = ng; ctx.fill(); ctx.restore()
    // cap
    const cr = r * 0.11
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8; circ(ctx, cx, cy, cr)
    const cg2 = ctx.createRadialGradient(cx - cr * 0.2, cy - cr * 0.3, 0, cx, cy, cr); pal.capOuter.forEach((c, i) => cg2.addColorStop(i / 3, c))
    ctx.fillStyle = cg2; ctx.fill(); ctx.restore()
    const cr2 = cr * 0.65, cg3 = ctx.createRadialGradient(cx - cr2 * 0.15, cy - cr2 * 0.2, 0, cx, cy, cr2); pal.capInner.forEach((c, i) => cg3.addColorStop(i / 2, c))
    circ(ctx, cx, cy, cr2); ctx.fillStyle = cg3; ctx.fill()
    circ(ctx, cx, cy, cr * 0.2); ctx.fillStyle = pal.capCenter; ctx.fill()
  }

  // Center text — render value or override
  {
    const fs = tk ? Math.max(16, px * 0.16) : Math.max(20, px * 0.22)
    const valY = tk ? cy + r * 0.15 : cy
    ctx.font = `700 ${fs}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = pal.centerValue; ctx.textAlign = "center"; ctx.textBaseline = "middle"
    const displayVal = cvOverride ?? `${Math.round(norm * prog + mn)}${unit ?? ''}`
    ctx.fillText(displayVal, cx, valY)
    if (cuOverride) { ctx.font = `500 ${Math.max(8, px * 0.06)}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = pal.centerUnit; ctx.fillText(cuOverride, cx, valY + fs * 0.65) }
    if (lbl) { ctx.font = `600 ${Math.max(7, px * 0.045)}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = pal.centerLabel; ctx.fillText(lbl, cx, valY - fs * 0.75) }
  }

  // Sub-dials
  if (subs?.length) {
    for (const sd of subs) {
      const sx = cx + sd.x * px, sy = cy + sd.y * px, sr = px * 0.10
      const bg = ctx.createRadialGradient(sx, sy - 1, sr * 0.2, sx, sy, sr); bg.addColorStop(0, pal.subDialBg[0]); bg.addColorStop(1, pal.subDialBg[1])
      circ(ctx, sx, sy, sr); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = pal.subDialBorder; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.beginPath(); ctx.arc(sx, sy, sr * 0.72, R(-225), R(45)); ctx.strokeStyle = pal.subDialTrack; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke()
      const sv = (sd.value / sd.max) * 270 * prog
      ctx.beginPath(); ctx.arc(sx, sy, sr * 0.72, R(-225), R(-225 + sv)); ctx.strokeStyle = sd.color; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke()
      ctx.font = `700 ${Math.max(8, sr * 0.55)}px 'Barlow Condensed','Outfit',sans-serif`; ctx.fillStyle = sd.color; ctx.textAlign = "center"; ctx.textBaseline = "middle"
      ctx.fillText(Math.round(sd.value * prog).toString(), sx, sy - sr * 0.05)
      if (dn !== "sm") { ctx.font = `500 ${Math.max(5, sr * 0.32)}px 'Barlow Condensed',sans-serif`; ctx.fillStyle = pal.axisLabel; ctx.fillText(sd.label, sx, sy + sr * 0.45) }
    }
  }

  // Odometer
  if (od) {
    const oy = cy + r * 0.62, dw = Math.max(10, px * 0.055), dh = Math.max(14, px * 0.07)
    let ox = cx - od.digits.length * (dw + 1) / 2
    for (let i = 0; i < od.digits.length; i++) {
      const last = i === od.digits.length - 1 && od.highlightLast
      ctx.fillStyle = last ? pal.signalDanger : pal.odometerBg; ctx.strokeStyle = last ? pal.signalDanger : pal.odometerBorder; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.roundRect(ox, oy - dh / 2, dw, dh, 2); ctx.fill(); ctx.stroke()
      ctx.font = `600 ${Math.max(7, dw * 0.6)}px 'Barlow Condensed',sans-serif`; ctx.fillStyle = pal.centerValue; ctx.textAlign = "center"; ctx.textBaseline = "middle"
      ctx.fillText(String(od.digits[i]), ox + dw / 2, oy); ox += dw + 1
    }
  }

  // Status LED
  if (led) {
    const lx = cx - r * 0.25, ly = cy + r * 0.38
    ctx.save(); ctx.shadowColor = led.color; ctx.shadowBlur = 6; circ(ctx, lx, ly, 3); ctx.fillStyle = led.color; ctx.fill(); ctx.restore()
    ctx.font = `500 ${Math.max(5, px * 0.03)}px 'Barlow Condensed',sans-serif`; ctx.fillStyle = led.color; ctx.textAlign = "left"; ctx.textBaseline = "middle"
    ctx.fillText(led.label, lx + 7, ly)
  }

  // Trend
  if (tr) {
    const tx = cx + r * 0.25, ty = cy + r * 0.38, arrow = tr.direction === "up" ? "\u25B2" : "\u25BC"
    ctx.font = `600 ${Math.max(6, px * 0.035)}px 'Barlow Condensed',sans-serif`; ctx.fillStyle = tr.color; ctx.textAlign = "right"; ctx.textBaseline = "middle"
    ctx.fillText(`${arrow} ${tr.delta}`, tx, ty)
  }

  // Crosshair / Multigraph complications
  if (ch) drawCrosshair(ctx, ch, cx, cy, r, px, prog, pal, qc)
  if (mg) drawMultigraph(ctx, mg, cx, cy, r, px, prog, pal)
}
