"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChartSeries { label?: string; data: number[]; color?: string }
export interface DonutSegment { value: number; label?: string; color?: string }
export interface BubblePoint { x: number; y: number; z?: number; label?: string; color?: string }
export interface RadarPoint { label: string; value: number }
export type ChartType = "sparkline" | "donut" | "area" | "bar" | "radar" | "bubble"

export interface MnChartProps extends React.HTMLAttributes<HTMLDivElement> {
  type: ChartType
  series?: ChartSeries[]
  segments?: DonutSegment[]
  points?: BubblePoint[]
  radarData?: RadarPoint[]
  labels?: string[]
  showLegend?: boolean
  animate?: boolean
}

const TOKENS = ["--mn-accent", "--mn-info", "--mn-warning", "--mn-success", "--mn-error", "--mn-text-muted"]

function cv(token: string, el: HTMLElement) { return getComputedStyle(el).getPropertyValue(token).trim() || "#888" }
function pal(i: number, custom: string | undefined, el: HTMLElement) { return custom ?? cv(TOKENS[i % TOKENS.length], el) }

function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr; canvas.height = h * dpr
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
  const ctx = canvas.getContext("2d")!; ctx.scale(dpr, dpr); return ctx
}

function drawSparkline(ctx: CanvasRenderingContext2D, w: number, h: number, series: ChartSeries[], el: HTMLElement, t: number) {
  const m = 4
  for (const [si, s] of series.entries()) {
    const d = s.data, n = d.length; if (!n) continue
    const hi = Math.max(...d), lo = Math.min(...d), r = hi - lo || 1
    const step = (w - m * 2) / (n - 1 || 1), color = pal(si, s.color, el)
    const len = Math.ceil(n * t)
    ctx.beginPath()
    for (let i = 0; i < len; i++) {
      const x = m + i * step, y = m + (1 - (d[i] - lo) / r) * (h - m * 2)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
    ctx.lineTo(m + (len - 1) * step, h - m); ctx.lineTo(m, h - m); ctx.closePath()
    ctx.globalAlpha = 0.12; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1
  }
}

function drawDonut(ctx: CanvasRenderingContext2D, w: number, h: number, segs: DonutSegment[], el: HTMLElement, t: number) {
  const cx = w / 2, cy = h / 2, radius = Math.min(cx, cy) - 8, thick = radius * 0.32
  const total = segs.reduce((a, s) => a + s.value, 0); if (!total) return
  let angle = -Math.PI / 2
  for (const [i, seg] of segs.entries()) {
    const sweep = (seg.value / total) * Math.PI * 2 * t
    ctx.beginPath(); ctx.arc(cx, cy, radius, angle + 0.03, angle + sweep - 0.03)
    ctx.strokeStyle = pal(i, seg.color, el); ctx.lineWidth = thick; ctx.lineCap = "round"; ctx.stroke()
    angle += (seg.value / total) * Math.PI * 2
  }
}

function drawBar(ctx: CanvasRenderingContext2D, w: number, h: number, series: ChartSeries[], labels: string[], el: HTMLElement, t: number) {
  const pl = 32, pt = 8, pb = 24, pr = 8
  const pw = w - pl - pr, ph = h - pt - pb
  const max = Math.max(...series.flatMap(s => s.data), 0) || 1
  const groups = Math.max(...series.map(s => s.data.length), 0)
  const gw = pw / (groups || 1), bw = Math.min(gw * 0.6 / (series.length || 1), 40)
  ctx.strokeStyle = cv("--mn-border", el); ctx.lineWidth = 0.5
  for (let i = 0; i <= 4; i++) { const y = pt + ph * i / 4; ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(w - pr, y); ctx.stroke() }
  for (const [si, s] of series.entries()) {
    for (let i = 0; i < s.data.length; i++) {
      const bh = (s.data[i] / max) * ph * t
      const x = pl + i * gw + (gw - bw * series.length) / 2 + si * bw
      ctx.fillStyle = pal(si, s.color, el)
      ctx.beginPath(); ctx.roundRect(x, pt + ph - bh, bw - 2, bh, [3, 3, 0, 0]); ctx.fill()
    }
  }
  ctx.fillStyle = cv("--mn-text-muted", el); ctx.font = "10px sans-serif"; ctx.textAlign = "center"
  for (let i = 0; i < groups && i < labels.length; i++) ctx.fillText(labels[i], pl + i * gw + gw / 2, h - 4)
}

function drawArea(ctx: CanvasRenderingContext2D, w: number, h: number, series: ChartSeries[], labels: string[], el: HTMLElement, t: number) {
  const m = 8, pb = 24, pw = w - m * 2, ph = h - m - pb
  const max = Math.max(...series.flatMap(s => s.data), 0) || 1
  for (const [si, s] of series.entries()) {
    const d = s.data, n = d.length; if (!n) continue
    const len = Math.ceil(n * t), step = pw / (n - 1 || 1), color = pal(si, s.color, el)
    ctx.beginPath()
    for (let i = 0; i < len; i++) { const x = m + i * step, y = m + (1 - d[i] / max) * ph; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
    ctx.lineTo(m + (len - 1) * step, m + ph); ctx.lineTo(m, m + ph); ctx.closePath()
    const grad = ctx.createLinearGradient(0, m, 0, m + ph); grad.addColorStop(0, color); grad.addColorStop(1, color)
    ctx.globalAlpha = 0.15; ctx.fillStyle = grad; ctx.fill(); ctx.globalAlpha = 1
  }
  if (labels.length) {
    const step = pw / (labels.length - 1 || 1)
    ctx.fillStyle = cv("--mn-text-muted", el); ctx.font = "10px sans-serif"; ctx.textAlign = "center"
    for (let i = 0; i < labels.length; i++) ctx.fillText(labels[i], m + i * step, h - 4)
  }
}

function drawRadar(ctx: CanvasRenderingContext2D, w: number, h: number, data: RadarPoint[], el: HTMLElement, t: number) {
  const cx = w / 2, cy = h / 2, radius = Math.min(cx, cy) - 24
  const n = data.length; if (!n) return
  const max = Math.max(...data.map(d => d.value), 1), aStep = (Math.PI * 2) / n
  ctx.strokeStyle = cv("--mn-border", el); ctx.lineWidth = 0.5
  for (let ring = 1; ring <= 4; ring++) {
    ctx.beginPath()
    for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i * aStep, rv = radius * ring / 4; i === 0 ? ctx.moveTo(cx + Math.cos(a) * rv, cy + Math.sin(a) * rv) : ctx.lineTo(cx + Math.cos(a) * rv, cy + Math.sin(a) * rv) }
    ctx.stroke()
  }
  ctx.fillStyle = cv("--mn-text-muted", el); ctx.font = "10px sans-serif"; ctx.textAlign = "center"
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + i * aStep
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius); ctx.stroke()
    ctx.fillText(data[i].label, cx + Math.cos(a) * (radius + 14), cy + Math.sin(a) * (radius + 14) + 3)
  }
  const color = cv("--mn-accent", el)
  ctx.beginPath()
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * aStep, v = (data[i].value / max) * radius * t; i === 0 ? ctx.moveTo(cx + Math.cos(a) * v, cy + Math.sin(a) * v) : ctx.lineTo(cx + Math.cos(a) * v, cy + Math.sin(a) * v) }
  ctx.closePath(); ctx.globalAlpha = 0.2; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
}

function drawBubble(ctx: CanvasRenderingContext2D, w: number, h: number, pts: BubblePoint[], el: HTMLElement, t: number) {
  if (!pts.length) return
  const m = 8, pw = w - m * 2, ph = h - m * 2
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  const xMin = Math.min(...xs), xR = Math.max(...xs) - xMin || 1
  const yMin = Math.min(...ys), yR = Math.max(...ys) - yMin || 1
  const maxZ = Math.max(...pts.map(p => p.z ?? 1), 1)
  for (const [i, p] of pts.entries()) {
    const x = m + ((p.x - xMin) / xR) * pw, y = m + (1 - (p.y - yMin) / yR) * ph
    const rad = Math.max(6, ((p.z ?? 1) / maxZ) * 30) * t, color = pal(i, p.color, el)
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2)
    ctx.globalAlpha = 0.4; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke()
    if (p.label) { ctx.fillStyle = cv("--mn-text-muted", el); ctx.font = "10px sans-serif"; ctx.textAlign = "center"; ctx.fillText(p.label, x, y + rad + 12) }
  }
}

export function MnChart({
  type, series = [], segments = [], points = [], radarData = [],
  labels = [], showLegend = false, animate = true, className, ...props
}: MnChartProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const progRef = React.useRef(0)
  const rafRef = React.useRef(0)
  const tblId = React.useId()
  const [tip, setTip] = React.useState<{ x: number; y: number; text: string } | null>(null)

  const draw = React.useCallback((p: number) => {
    const canvas = canvasRef.current, wrap = wrapRef.current; if (!canvas || !wrap) return
    const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return
    const ctx = setupCanvas(canvas, w, h); ctx.clearRect(0, 0, w, h)
    if (type === "sparkline") drawSparkline(ctx, w, h, series, wrap, p)
    else if (type === "donut") drawDonut(ctx, w, h, segments, wrap, p)
    else if (type === "bar") drawBar(ctx, w, h, series, labels, wrap, p)
    else if (type === "area") drawArea(ctx, w, h, series, labels, wrap, p)
    else if (type === "radar") drawRadar(ctx, w, h, radarData, wrap, p)
    else if (type === "bubble") drawBubble(ctx, w, h, points, wrap, p)
  }, [type, series, segments, points, radarData, labels])

  React.useEffect(() => {
    if (!animate) { progRef.current = 1; draw(1); return }
    progRef.current = 0; const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / 600, 1); progRef.current = t * (2 - t)
      draw(progRef.current); if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw, animate])

  React.useEffect(() => {
    const el = wrapRef.current; if (!el) return
    const ro = new ResizeObserver(() => draw(progRef.current || 1)); ro.observe(el)
    return () => ro.disconnect()
  }, [draw])

  const onMove = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return
    const mx = e.clientX - rect.left
    let text = ""
    if ((type === "sparkline" || type === "area") && series[0]?.data.length) {
      const d = series[0].data, m = type === "area" ? 8 : 4, step = (rect.width - m * 2) / (d.length - 1 || 1)
      const i = Math.round((mx - m) / step)
      if (i >= 0 && i < d.length) text = `${labels[i] ?? `#${i}`}: ${d[i]}`
    } else if (type === "bar" && series[0]?.data.length) {
      const d = series[0].data, gw = (rect.width - 40) / d.length, i = Math.floor((mx - 32) / gw)
      if (i >= 0 && i < d.length) text = `${labels[i] ?? `#${i}`}: ${d[i]}`
    } else if (type === "donut" && segments.length) {
      const cx = rect.width / 2, cy = rect.height / 2, my = e.clientY - rect.top
      const dist = Math.hypot(mx - cx, my - cy), radius = Math.min(cx, cy) - 8
      if (dist > radius * 0.5 && dist < radius * 1.2) {
        let a = Math.atan2(my - cy, mx - cx) + Math.PI / 2; if (a < 0) a += Math.PI * 2
        const total = segments.reduce((s, seg) => s + seg.value, 0); let cum = 0
        for (const seg of segments) { cum += seg.value / total; if (a / (Math.PI * 2) <= cum) { text = `${seg.label ?? "Segment"}: ${seg.value}`; break } }
      }
    }
    setTip(text ? { x: e.clientX - rect.left, y: e.clientY - rect.top - 28, text } : null)
  }, [type, series, segments, labels])

  const legendItems = React.useMemo(() => {
    if (!showLegend) return []
    if (type === "donut") return segments.map((s, i) => ({ label: s.label ?? `Segment ${i + 1}`, idx: i, color: s.color }))
    if (type === "bubble") return points.map((p, i) => ({ label: p.label ?? `Point ${i + 1}`, idx: i, color: p.color }))
    if (type === "radar") return [{ label: "Value", idx: 0, color: undefined }]
    return series.map((s, i) => ({ label: s.label ?? `Series ${i + 1}`, idx: i, color: s.color }))
  }, [showLegend, type, series, segments, points, radarData])

  const a11yRows = React.useMemo(() => {
    if (type === "donut") return segments.map(s => [s.label ?? "", String(s.value)])
    if (type === "bubble") return points.map(p => [p.label ?? "", `x:${p.x} y:${p.y} z:${p.z ?? 1}`])
    if (type === "radar") return radarData.map(d => [d.label, String(d.value)])
    return series.flatMap(s => s.data.map((v, i) => [labels[i] ?? `#${i}`, String(v)]))
  }, [type, series, segments, points, radarData, labels])

  return (
    <div className={cn("relative", className)} {...props}>
      <div ref={wrapRef} className="relative h-48 w-full" role="img" aria-label={`${type} chart`} aria-describedby={tblId}>
        <canvas ref={canvasRef} className="absolute inset-0" onMouseMove={onMove} onMouseLeave={() => setTip(null)} />
        {tip && (
          <div role="tooltip" className="pointer-events-none absolute z-10 rounded bg-[var(--mn-surface-raised)] px-2 py-1 text-xs text-[var(--mn-text)] shadow-md" style={{ left: tip.x, top: Math.max(0, tip.y) }}>
            {tip.text}
          </div>
        )}
      </div>
      {showLegend && legendItems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--mn-text-muted)]" aria-label="Chart legend">
          {legendItems.map((it) => (
            <span key={it.idx} className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: it.color ?? `var(${TOKENS[it.idx % TOKENS.length]})` }} />
              {it.label}
            </span>
          ))}
        </div>
      )}
      <table id={tblId} className="sr-only"><caption>{type} chart data</caption>
        <thead><tr><th>Label</th><th>Value</th></tr></thead>
        <tbody>{a11yRows.map((r, i) => <tr key={i}><td>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
