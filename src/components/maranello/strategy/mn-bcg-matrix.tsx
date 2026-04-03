"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────────── */
export interface BCGItem {
  id: string; label: string; marketShare: number; growthRate: number
  size?: number; color?: string
}

type Quad = "Stars" | "Cash Cows" | "? Marks" | "Dogs"
const QUADS: Quad[] = ["Stars", "Cash Cows", "? Marks", "Dogs"]
const M = { top: 16, right: 16, bottom: 40, left: 48 }
const FONT = "10px Inter, sans-serif"

const bcgMatrixWrap = cva("relative block", {
  variants: { size: { sm: "max-w-xs", md: "max-w-md", lg: "max-w-xl", fluid: "w-full" } },
  defaultVariants: { size: "md" },
})

export interface MnBcgMatrixProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof bcgMatrixWrap> {
  items?: BCGItem[]; height?: number
  shareThreshold?: number; growthThreshold?: number; animate?: boolean
  onItemHover?: (item: BCGItem | null) => void
  onItemClick?: (item: BCGItem) => void
}

/* ── Helpers ───────────────────────────────────────────────── */
function cssv(el: Element, n: string, fb: string): string {
  return getComputedStyle(el).getPropertyValue(n).trim() || fb
}
function hexRgba(hex: string, a: number): string {
  return `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`
}
function quadOf(it: BCGItem, sT: number, gT: number): Quad {
  const hs = it.marketShare >= sT, hg = it.growthRate >= gT
  if (hs && hg) return "Stars"; if (hs) return "Cash Cows"; if (hg) return "? Marks"; return "Dogs"
}
function quadHex(el: Element, q: Quad): string {
  const m: Record<Quad, [string, string]> = {
    Stars: ["--signal-ok", "#00A651"], "Cash Cows": ["--mn-accent", "#FFC72C"],
    "? Marks": ["--signal-warning", "#FFC72C"], Dogs: ["--mn-text-muted", "#767676"],
  }
  return cssv(el, m[q][0], m[q][1])
}
function qColor(el: Element, q: Quad, a: number): string {
  const h = quadHex(el, q)
  return h.startsWith("#") && h.length >= 7 ? hexRgba(h, a) : h
}
function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "\u2026" : s
}

/* ── Coordinate helpers (shared by render + hitTest) ───────── */
function makeCoords(items: BCGItem[], w: number, h: number, sT: number, gT: number) {
  const pW = w - M.left - M.right, pH = h - M.top - M.bottom
  const rs = items.map((i) => i.growthRate)
  const mn = Math.min(0, ...rs) - 5, mx = Math.max(20, ...rs) + 5
  const toX = (s: number) => M.left + (1 - s) * pW
  const toY = (g: number) => M.top + (1 - (g - mn) / (mx - mn)) * pH
  const bR = (sz: number) => 8 + sz * 3
  return { pW, pH, toX, toY, bR, midX: toX(sT), midY: toY(gT) }
}

/* ── Canvas rendering ──────────────────────────────────────── */
function render(
  cvs: HTMLCanvasElement, items: BCGItem[], sT: number, gT: number,
  hovId: string | null, sc: number,
) {
  const ctx = cvs.getContext("2d")
  if (!ctx) return
  const el = cvs.parentElement ?? cvs
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const w = Math.max(cvs.getBoundingClientRect().width, 200), h = cvs.height / dpr
  if (w < 40 || h < 40) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h)

  const tm = cssv(el, "--mn-text-muted", "#888"), bd = cssv(el, "--mn-border", "#3a3a3a")
  const sf = cssv(el, "--mn-surface", "#1a1a1a"), tx = cssv(el, "--mn-text", "#fafafa")
  const { pW, pH, toX, toY, bR, midX, midY } = makeCoords(items, w, h, sT, gT)

  /* Quadrant fills */
  const qr: [number, number, number, number, Quad][] = [
    [M.left, M.top, midX - M.left, midY - M.top, "Stars"],
    [M.left, midY, midX - M.left, M.top + pH - midY, "Cash Cows"],
    [midX, M.top, M.left + pW - midX, midY - M.top, "? Marks"],
    [midX, midY, M.left + pW - midX, M.top + pH - midY, "Dogs"],
  ]
  for (const [x, y, qw, qh, q] of qr) { ctx.fillStyle = qColor(el, q, 0.1); ctx.fillRect(x, y, qw, qh) }

  /* Quadrant labels */
  ctx.font = FONT; ctx.fillStyle = tm; ctx.textAlign = "left"
  ctx.fillText("Stars", M.left + 6, M.top + 14)
  ctx.fillText("Cash Cows", M.left + 6, M.top + pH - 6)
  ctx.textAlign = "right"
  ctx.fillText("? Marks", M.left + pW - 6, M.top + 14)
  ctx.fillText("Dogs", M.left + pW - 6, M.top + pH - 6)

  /* Dashed midpoint lines */
  ctx.strokeStyle = bd; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.beginPath()
  ctx.moveTo(midX, M.top); ctx.lineTo(midX, M.top + pH)
  ctx.moveTo(M.left, midY); ctx.lineTo(M.left + pW, midY)
  ctx.stroke(); ctx.setLineDash([])

  /* Axis labels */
  ctx.fillStyle = tm; ctx.font = FONT; ctx.textAlign = "center"
  ctx.fillText("\u2190 Relative Market Share \u2192", M.left + pW / 2, h - 8)
  ctx.save(); ctx.translate(12, M.top + pH / 2); ctx.rotate(-Math.PI / 2)
  ctx.fillText("Market Growth Rate %", 0, 0); ctx.restore()

  /* Bubbles */
  for (const it of items) {
    const bx = toX(it.marketShare), by = toY(it.growthRate), r = bR(it.size ?? 5) * sc
    const q = quadOf(it, sT, gT)
    ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2)
    ctx.fillStyle = it.color ?? qColor(el, q, 0.7); ctx.fill()
    ctx.strokeStyle = it.color ?? qColor(el, q, 1); ctx.lineWidth = 1.5; ctx.stroke()
    ctx.fillStyle = tx; ctx.font = FONT; ctx.textAlign = "center"
    ctx.fillText(trunc(it.label, 12), bx, by + r + 12)
    if (it.id === hovId) {
      ctx.beginPath(); ctx.arc(bx, by, r + 4, 0, Math.PI * 2)
      ctx.strokeStyle = cssv(el, "--mn-accent", "#FFC72C"); ctx.lineWidth = 2; ctx.stroke()
      const l1 = it.label
      const l2 = `Share: ${(it.marketShare * 100).toFixed(0)}% | Growth: ${it.growthRate.toFixed(1)}%`
      ctx.font = FONT
      const tw = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 12
      const tbx = Math.min(Math.max(bx - tw / 2, M.left), M.left + pW - tw)
      const tby = Math.max(by - r - 36, M.top)
      ctx.fillStyle = sf; ctx.fillRect(tbx, tby, tw, 30)
      ctx.strokeStyle = bd; ctx.lineWidth = 1; ctx.strokeRect(tbx, tby, tw, 30)
      ctx.fillStyle = tx; ctx.textAlign = "left"
      ctx.fillText(l1, tbx + 6, tby + 12); ctx.fillText(l2, tbx + 6, tby + 24)
    }
  }
}

/* ── Component ─────────────────────────────────────────────── */
function MnBcgMatrix({
  items = [], height = 320, shareThreshold = 0.5, growthThreshold = 10,
  animate = true, onItemHover, onItemClick, size = "md", className, ...rest
}: MnBcgMatrixProps) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)
  const hovRef = React.useRef<string | null>(null)

  const setupCanvas = React.useCallback(() => {
    if (!cvs.current) return
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    const w = Math.max(cvs.current.getBoundingClientRect().width, 200)
    cvs.current.width = w * dpr; cvs.current.height = height * dpr
    cvs.current.style.width = `${w}px`; cvs.current.style.height = `${height}px`
  }, [height])

  const draw = React.useCallback(
    (sc: number) => { if (cvs.current) render(cvs.current, items, shareThreshold, growthThreshold, hovRef.current, sc) },
    [items, shareThreshold, growthThreshold],
  )

  React.useEffect(() => {
    cancelAnimationFrame(raf.current); setupCanvas()
    if (!animate) { draw(1); return }
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 400, 1); draw(1 - (1 - p) ** 3)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [animate, draw, setupCanvas])

  const hitTest = React.useCallback((ex: number, ey: number): BCGItem | null => {
    if (!cvs.current) return null
    const w = Math.max(cvs.current.getBoundingClientRect().width, 200)
    const { toX, toY, bR } = makeCoords(items, w, height, shareThreshold, growthThreshold)
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i], dx = ex - toX(it.marketShare), dy = ey - toY(it.growthRate)
      if (Math.hypot(dx, dy) <= bR(it.size ?? 5)) return it
    }
    return null
  }, [items, height, shareThreshold, growthThreshold])

  React.useEffect(() => {
    const c = cvs.current; if (!c) return
    const coords = (e: MouseEvent) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
    const onMove = (e: MouseEvent) => {
      const hit = hitTest(coords(e).x, coords(e).y), nid = hit?.id ?? null
      if (nid !== hovRef.current) { hovRef.current = nid; draw(1); onItemHover?.(hit) }
    }
    const onDown = (e: MouseEvent) => { const hit = hitTest(coords(e).x, coords(e).y); if (hit) onItemClick?.(hit) }
    const onLeave = () => { if (hovRef.current) { hovRef.current = null; draw(1); onItemHover?.(null) } }
    c.addEventListener("mousemove", onMove); c.addEventListener("mousedown", onDown); c.addEventListener("mouseleave", onLeave)
    return () => { c.removeEventListener("mousemove", onMove); c.removeEventListener("mousedown", onDown); c.removeEventListener("mouseleave", onLeave) }
  }, [hitTest, draw, onItemHover, onItemClick])

  const ariaLabel = React.useMemo(() => {
    const grp: Record<Quad, string[]> = { Stars: [], "Cash Cows": [], "? Marks": [], Dogs: [] }
    for (const it of items) grp[quadOf(it, shareThreshold, growthThreshold)].push(it.label)
    const desc = QUADS.filter((q) => grp[q].length > 0).map((q) => `${q}: ${grp[q].join(", ")}`).join(". ")
    return `BCG matrix with ${items.length} items. ${desc}`
  }, [items, shareThreshold, growthThreshold])

  return (
    <div ref={wrap} className={cn(bcgMatrixWrap({ size: size as "sm" | "md" | "lg" | "fluid" }), className)} {...rest}>
      <canvas ref={cvs} role="img" aria-label={ariaLabel} className="block w-full" />
    </div>
  )
}

export { MnBcgMatrix, bcgMatrixWrap }
