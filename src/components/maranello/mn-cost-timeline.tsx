"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const costTimelineWrap = cva("relative block", {
  variants: { size: { sm: "h-40", md: "h-52", lg: "h-72", fluid: "h-full w-full" } },
  defaultVariants: { size: "md" },
})
type TimelineSize = NonNullable<VariantProps<typeof costTimelineWrap>["size"]>

export interface CostSeries { id: string; label: string; color?: string; values: number[] }

export interface MnCostTimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof costTimelineWrap> {
  labels: string[]
  series: CostSeries[]
  stacked?: boolean
  animate?: boolean
  unit?: string
  onHover?: (label: string, values: Record<string, number>) => void
}

const PAD = { top: 20, right: 16, bottom: 36, left: 52 } as const
const GRID_N = 5
const ANIM_MS = 600
const PALETTE = [
  "var(--mn-accent, #FFC72C)", "var(--mn-info, #3B82F6)", "var(--mn-success, #00A651)",
  "var(--mn-warning, #FFC72C)", "var(--mn-error, #DC0000)", "var(--mn-text-muted, #888)",
] as const

function rv(raw: string): string {
  if (typeof document === "undefined") return raw
  const m = raw.match(/var\(([^,)]+),?\s*([^)]*)\)/)
  if (!m) return raw
  return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || m[2] || "#888"
}
function pal(i: number, c?: string): string {
  if (c) return c.startsWith("--") ? rv(`var(${c}, #888)`) : c
  return rv(PALETTE[i % PALETTE.length])
}
function ha(hex: string, a: number): string {
  const h = hex.startsWith("#") ? hex : "#888888"
  return `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`
}
function fmtY(v: number, u: string): string {
  if (v >= 1e6) return `${u}${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${u}${(v / 1e3).toFixed(1)}k`
  return `${u}${Math.round(v)}`
}
function buildStacks(series: CostSeries[]): number[][] {
  const n = series[0]?.values.length ?? 0, out: number[][] = []
  for (let s = 0; s < series.length; s++)
    out[s] = Array.from({ length: n }, (_, i) => (series[s].values[i] ?? 0) + (s > 0 ? out[s - 1][i] : 0))
  return out
}
const easeOut = (t: number): number => 1 - (1 - t) ** 3

function draw(
  cvs: HTMLCanvasElement,
  cfg: { labels: string[]; series: CostSeries[]; stacked: boolean; unit: string },
  clip: number, hx: number,
): void {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const rect = cvs.getBoundingClientRect()
  const w = Math.max(rect.width, 200), h = Math.max(rect.height, 100)
  cvs.width = w * dpr; cvs.height = h * dpr
  cvs.style.width = `${w}px`; cvs.style.height = `${h}px`
  const ctx = cvs.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h)
  const n = cfg.labels.length
  if (n < 2 || cfg.series.length === 0) return
  const pW = w - PAD.left - PAD.right, pH = h - PAD.top - PAD.bottom
  const xS = pW / (n - 1), gx = (i: number) => PAD.left + i * xS
  const stk = cfg.stacked ? buildStacks(cfg.series) : []
  const mx = (cfg.stacked ? Math.max(...(stk[stk.length - 1] ?? [1]))
    : Math.max(...cfg.series.flatMap((s) => s.values))) * 1.1 || 1
  const gy = (v: number) => PAD.top + pH - (v / mx) * pH
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, PAD.left + pW * clip + PAD.right, h); ctx.clip()

  const bC = rv("var(--mn-border, #333)"), mC = rv("var(--mn-text-muted, #888)")
  ctx.setLineDash([4, 4]); ctx.lineWidth = 0.5
  for (let g = 0; g <= GRID_N; g++) {
    const v = (mx / GRID_N) * g, yy = gy(v)
    ctx.strokeStyle = ha(bC.startsWith("#") ? bC : "#333", 0.3)
    ctx.beginPath(); ctx.moveTo(PAD.left, yy); ctx.lineTo(w - PAD.right, yy); ctx.stroke()
    ctx.fillStyle = mC; ctx.font = "10px sans-serif"; ctx.textAlign = "right"
    ctx.fillText(fmtY(v, cfg.unit), PAD.left - 6, yy + 3)
  }
  ctx.setLineDash([])

  for (let s = cfg.series.length - 1; s >= 0; s--) {
    const c = pal(s, cfg.series[s].color)
    const top = cfg.stacked ? stk[s] : cfg.series[s].values
    const bot = cfg.stacked && s > 0 ? stk[s - 1] : null
    ctx.beginPath(); ctx.moveTo(gx(0), gy(top[0]))
    for (let i = 1; i < n; i++) ctx.lineTo(gx(i), gy(top[i]))
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(gx(i), gy(bot ? bot[i] : 0))
    ctx.closePath(); ctx.fillStyle = ha(c, cfg.stacked ? 0.25 : 0.15); ctx.fill()
    ctx.beginPath(); ctx.moveTo(gx(0), gy(top[0]))
    for (let i = 1; i < n; i++) ctx.lineTo(gx(i), gy(top[i]))
    ctx.strokeStyle = ha(c, 0.8); ctx.lineWidth = 1.5; ctx.stroke()
  }

  ctx.fillStyle = mC; ctx.font = "9px sans-serif"; ctx.textAlign = "center"
  const sk = Math.ceil(n / (pW / 48))
  for (let i = 0; i < n; i += sk) ctx.fillText(cfg.labels[i], gx(i), h - PAD.bottom + 14)

  // Legend
  ctx.font = "9px sans-serif"; ctx.textAlign = "left"; const lY = h - 6
  const items = cfg.series.map((s, i) => ({ l: s.label, c: pal(i, s.color), w: ctx.measureText(s.label).width + 16 }))
  const tW = items.reduce((a, x) => a + x.w + 8, -8)
  let lx = PAD.left + (pW - tW) / 2
  for (const it of items) {
    ctx.fillStyle = it.c; ctx.fillRect(lx, lY - 6, 8, 8)
    ctx.fillStyle = mC; ctx.fillText(it.l, lx + 12, lY); lx += it.w + 8
  }

  if (hx >= PAD.left && hx <= w - PAD.right) {
    const ci = Math.max(0, Math.min(n - 1, Math.round((hx - PAD.left) / xS))), rx = gx(ci)
    const tC = rv("var(--mn-text, #fff)")
    ctx.strokeStyle = ha(tC.startsWith("#") ? tC : "#fff", 0.4)
    ctx.lineWidth = 1; ctx.setLineDash([2, 2])
    ctx.beginPath(); ctx.moveTo(rx, PAD.top); ctx.lineTo(rx, h - PAD.bottom); ctx.stroke()
    ctx.setLineDash([])
    for (let s = 0; s < cfg.series.length; s++) {
      const c = pal(s, cfg.series[s].color)
      const py = gy(cfg.stacked ? stk[s][ci] : cfg.series[s].values[ci])
      ctx.beginPath(); ctx.arc(rx, py, 8, 0, Math.PI * 2); ctx.fillStyle = ha(c, 0.25); ctx.fill()
      ctx.beginPath(); ctx.arc(rx, py, 4, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill()
    }
    const lines = [cfg.labels[ci], ...cfg.series.map((s) => `${s.label}: ${cfg.unit}${(s.values[ci] ?? 0).toFixed(2)}`)]
    ctx.font = "10px sans-serif"
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 16, th = lines.length * 14 + 10
    const tx = rx + 12 + tw > w ? rx - tw - 8 : rx + 12, ty = PAD.top + 4
    const sC = rv("var(--mn-surface, #1a1a1a)")
    ctx.fillStyle = sC.startsWith("#") ? sC : "#1a1a1a"
    ctx.strokeStyle = bC.startsWith("#") ? bC : "#333"; ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(tx, ty, tw, th, 4); ctx.fill(); ctx.stroke()
    ctx.fillStyle = rv("var(--mn-text, #fafafa)")
    lines.forEach((l, i) => {
      ctx.font = i === 0 ? "bold 10px sans-serif" : "10px sans-serif"
      ctx.fillText(l, tx + 8, ty + 14 + i * 14)
    })
  }
  ctx.restore()
}

function MnCostTimeline({
  labels, series, stacked = true, animate = true, unit = "$",
  size = "md", onHover, className, ...rest
}: MnCostTimelineProps) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)
  const hoverRef = React.useRef(-1)

  const cfg = React.useMemo(() => ({ labels, series, stacked, unit }), [labels, series, stacked, unit])
  const redraw = React.useCallback(
    (c: number) => { if (cvs.current) draw(cvs.current, cfg, c, hoverRef.current) }, [cfg],
  )

  React.useEffect(() => {
    cancelAnimationFrame(raf.current)
    if (!animate) { redraw(1); return }
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - t0) / ANIM_MS, 1); redraw(easeOut(t))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [animate, redraw])

  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !wrap.current) return
    let tid: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => { clearTimeout(tid); tid = setTimeout(() => redraw(1), 100) })
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [redraw])

  const handleMove = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    hoverRef.current = e.nativeEvent.offsetX; redraw(1)
    if (onHover && cvs.current) {
      const pW = Math.max(cvs.current.getBoundingClientRect().width, 200) - PAD.left - PAD.right
      const xS = pW / (labels.length - 1)
      const ci = Math.max(0, Math.min(labels.length - 1, Math.round((hoverRef.current - PAD.left) / xS)))
      const vals: Record<string, number> = {}
      series.forEach((s) => { vals[s.id] = s.values[ci] ?? 0 })
      onHover(labels[ci], vals)
    }
  }, [labels, series, onHover, redraw])

  const handleLeave = React.useCallback(() => { hoverRef.current = -1; redraw(1) }, [redraw])

  return (
    <div ref={wrap} className={cn(costTimelineWrap({ size: size as TimelineSize }), className)} {...rest}>
      <canvas
        ref={cvs} role="img"
        aria-label={`Cost timeline: ${series.length} series over ${labels.length} periods`}
        className="block h-full w-full" onMouseMove={handleMove} onMouseLeave={handleLeave}
      />
      <div className="sr-only">
        <table>
          <caption>Cost timeline</caption>
          <thead><tr><th>Period</th>{series.map((s) => <th key={s.id}>{s.label}</th>)}</tr></thead>
          <tbody>
            {labels.map((lbl, i) => (
              <tr key={lbl}>
                <th scope="row">{lbl}</th>
                {series.map((s) => <td key={s.id}>{unit}{(s.values[i] ?? 0).toFixed(2)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { MnCostTimeline, costTimelineWrap }
