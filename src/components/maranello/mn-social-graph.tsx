"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export interface SocialGraphNode { id: string; label: string; group?: string; detail?: string; size?: number }
export interface SocialGraphEdge { source: string; target: string; weight?: number }

const socialGraphWrap = cva("relative block overflow-hidden rounded-lg border bg-card", {
  variants: { size: { sm: "h-60", md: "h-80", lg: "h-[480px]", fluid: "h-full w-full min-h-60" } },
  defaultVariants: { size: "md" },
})
type SocialGraphSize = "sm" | "md" | "lg" | "fluid"

export interface MnSocialGraphProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, VariantProps<typeof socialGraphWrap> {
  nodes: SocialGraphNode[]; edges: SocialGraphEdge[]
  groups?: Record<string, string>; animate?: boolean; showLabels?: boolean
  onNodeClick?: (node: SocialGraphNode) => void; onNodeHover?: (node: SocialGraphNode | null) => void
}

/* ── Internal types & helpers ──────────────────────────────── */
type SimNode = SocialGraphNode & { x: number; y: number; vx: number; vy: number; fx: number; fy: number }
interface SimState {
  nodes: SimNode[]; edges: SocialGraphEdge[]
  nodeMap: Map<string, SimNode>; linked: Map<string, Set<string>>
  raf: number; frame: number; running: boolean
  hoveredId: string | null; dragging: SimNode | null; dragMoved: boolean; w: number; h: number; loop: () => void
}
function cssVar(el: Element, name: string, fb: string): string { return getComputedStyle(el).getPropertyValue(name).trim() || fb }
function getInitials(n: SocialGraphNode): string { const p = n.label.split(/\s+/).filter(Boolean).slice(0, 2); return (p.map((s) => s[0]).join("") || n.id.slice(0, 2)).toUpperCase() }
function hitTest(nodes: SimNode[], x: number, y: number): SimNode | null { for (let i = nodes.length - 1; i >= 0; i--) { if (Math.hypot(x - nodes[i].x, y - nodes[i].y) <= (nodes[i].size ?? 16) + 3) return nodes[i] }; return null }

/* ── Force simulation ──────────────────────────────────────── */

function forceStep(s: SimState): void {
  const { nodes, edges, nodeMap, w, h, frame } = s
  if (nodes.length < 2) return
  const k = Math.sqrt(Math.max(w * h, 1) / Math.max(nodes.length, 1))
  for (const n of nodes) { n.fx = 0; n.fy = 0 }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]
      const dx = a.x - b.x, dy = a.y - b.y, d = Math.max(12, Math.hypot(dx, dy))
      const f = (k * k) / d, nx = dx / d, ny = dy / d
      a.fx += nx * f; a.fy += ny * f; b.fx -= nx * f; b.fy -= ny * f
    }
  }
  for (const e of edges) {
    const a = nodeMap.get(e.source), b = nodeMap.get(e.target)
    if (!a || !b) continue
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.max(12, Math.hypot(dx, dy))
    const f = ((d * d) / k) * 0.02 * (e.weight ?? 1), nx = dx / d, ny = dy / d
    a.fx += nx * f; a.fy += ny * f; b.fx -= nx * f; b.fy -= ny * f
  }
  const cx = w / 2, cy = h / 2, temp = Math.max(0.35, 16 * (1 - frame / 200))
  for (const n of nodes) {
    if (n.id === s.dragging?.id) { n.vx = 0; n.vy = 0; continue }
    n.fx += (cx - n.x) * 0.02; n.fy += (cy - n.y) * 0.02
    n.vx = (n.vx + n.fx * 0.008) * 0.88; n.vy = (n.vy + n.fy * 0.008) * 0.88
    const mag = Math.max(1, Math.hypot(n.vx, n.vy)), move = Math.min(temp, mag)
    n.x += (n.vx / mag) * move; n.y += (n.vy / mag) * move
    const pad = (n.size ?? 16) + 10
    n.x = Math.min(w - pad, Math.max(pad, n.x)); n.y = Math.min(h - pad, Math.max(pad, n.y))
  }
}

/* ── Draw ──────────────────────────────────────────────────── */

function drawGraph(
  ctx: CanvasRenderingContext2D, s: SimState,
  groups: Record<string, string>, showLabels: boolean, el: Element,
): void {
  const { w, h, nodes, edges, nodeMap, linked, hoveredId } = s
  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const textCol = cssVar(el, "--mn-text", "rgba(245,245,245,.92)")
  const edgeCol = cssVar(el, "--mn-border", "rgba(213,217,224,.28)")
  const accent = cssVar(el, "--mn-accent", "hsl(45 100% 58%)")
  const ringCol = cssVar(el, "--mn-node-ring", "rgba(255,255,255,.72)")
  const innerCol = cssVar(el, "--mn-node-text", "#111")
  const nb = hoveredId ? linked.get(hoveredId) ?? new Set<string>() : null

  for (const e of edges) {
    const a = nodeMap.get(e.source), b = nodeMap.get(e.target)
    if (!a || !b) continue
    const em = !hoveredId || e.source === hoveredId || e.target === hoveredId
    ctx.save(); ctx.globalAlpha = hoveredId ? (em ? 0.8 : 0.1) : 0.28
    ctx.strokeStyle = edgeCol; ctx.lineWidth = Math.max(1, (e.weight ?? 1) * (em ? 1.5 : 1))
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore()
  }
  for (const n of nodes) {
    const r = n.size ?? 16, focus = n.id === hoveredId, near = nb?.has(n.id)
    const col = groups[n.group ?? ""] ?? accent
    ctx.save(); ctx.globalAlpha = hoveredId ? (focus || near ? 1 : 0.18) : 1
    ctx.fillStyle = col
    if (focus) { ctx.shadowColor = col; ctx.shadowBlur = 16 }
    ctx.beginPath(); ctx.arc(n.x, n.y, r + (focus ? 2 : 0), 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0; ctx.lineWidth = focus ? 2.5 : 1; ctx.strokeStyle = ringCol; ctx.stroke()
    ctx.fillStyle = innerCol
    ctx.font = `600 ${Math.max(10, r * 0.8)}px Inter,system-ui,sans-serif`
    ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillText(getInitials(n), n.x, n.y + 0.5, r * 1.5)
    if (showLabels) {
      ctx.fillStyle = textCol; ctx.font = "500 12px Inter,system-ui,sans-serif"
      ctx.textBaseline = "top"; ctx.fillText(n.label, n.x, n.y + r + 8)
    }
    ctx.restore()
  }
}

/* ── Component ─────────────────────────────────────────────── */

const NO_GROUPS: Record<string, string> = {}

function MnSocialGraph({
  nodes: inputNodes, edges: inputEdges, groups = NO_GROUPS, animate = true,
  showLabels = true, onNodeClick, onNodeHover, size = "md", className, ...rest
}: MnSocialGraphProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const cvsRef = React.useRef<HTMLCanvasElement>(null)
  const sim = React.useRef<SimState>({
    nodes: [], edges: [], nodeMap: new Map(), linked: new Map(),
    raf: 0, frame: 0, running: false, hoveredId: null,
    dragging: null, dragMoved: false, w: 0, h: 0, loop: () => {},
  }).current
  const [tip, setTip] = React.useState<{ label: string; detail?: string; x: number; y: number } | null>(null)

  const redraw = React.useCallback(() => {
    const ctx = cvsRef.current?.getContext("2d")
    if (ctx && wrapRef.current) drawGraph(ctx, sim, groups, showLabels, wrapRef.current)
  }, [groups, showLabels, sim])

  const resize = React.useCallback(() => {
    const wrap = wrapRef.current, cvs = cvsRef.current
    if (!wrap || !cvs) return
    const r = wrap.getBoundingClientRect(), dpr = window.devicePixelRatio || 1
    sim.w = Math.max(320, Math.round(r.width)); sim.h = Math.max(240, Math.round(r.height))
    cvs.width = Math.round(sim.w * dpr); cvs.height = Math.round(sim.h * dpr)
    cvs.style.width = `${sim.w}px`; cvs.style.height = `${sim.h}px`
  }, [sim])

  React.useEffect(() => {
    resize()
    const prev = sim.nodeMap
    sim.nodes = inputNodes.map((n, i) => {
      const old = prev.get(n.id), a = (i / Math.max(inputNodes.length, 1)) * Math.PI * 2
      const rad = Math.min(sim.w || 640, sim.h || 420) * 0.28
      return { ...n, x: old?.x ?? (sim.w || 640) / 2 + Math.cos(a) * rad * (0.55 + Math.random() * 0.45),
        y: old?.y ?? (sim.h || 420) / 2 + Math.sin(a) * rad * (0.55 + Math.random() * 0.45),
        vx: old?.vx ?? 0, vy: old?.vy ?? 0, fx: 0, fy: 0 }
    })
    sim.nodeMap = new Map(sim.nodes.map((n) => [n.id, n]))
    sim.edges = inputEdges.filter((e) => sim.nodeMap.has(e.source) && sim.nodeMap.has(e.target))
    sim.linked = new Map(sim.nodes.map((n) => [n.id, new Set<string>()]))
    for (const e of sim.edges) { sim.linked.get(e.source)?.add(e.target); sim.linked.get(e.target)?.add(e.source) }
    sim.frame = 0; sim.running = animate && sim.nodes.length > 1
    const tick = () => {
      sim.raf = 0
      if (sim.running && sim.frame < 200) { forceStep(sim); sim.frame++; if (sim.frame >= 200) sim.running = false }
      redraw(); if (sim.running) sim.loop()
    }
    sim.loop = () => { if (!sim.raf && sim.running) sim.raf = requestAnimationFrame(tick) }
    redraw(); sim.loop()
    return () => { if (sim.raf) { cancelAnimationFrame(sim.raf); sim.raf = 0 } }
  }, [inputNodes, inputEdges, animate, resize, redraw, sim])

  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !wrapRef.current) return
    const ro = new ResizeObserver(() => { resize(); redraw() })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [resize, redraw])

  React.useEffect(() => {
    const cvs = cvsRef.current
    if (!cvs) return
    const pt = (e: MouseEvent) => { const r = cvs.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
    const onDown = (e: MouseEvent) => {
      const p = pt(e), n = hitTest(sim.nodes, p.x, p.y)
      if (!n) return
      sim.dragging = n; sim.dragMoved = false; sim.hoveredId = n.id
      onNodeHover?.(n); setTip({ label: n.label, detail: n.detail, x: p.x, y: p.y }); redraw()
    }
    const onMove = (e: MouseEvent) => {
      const p = pt(e)
      if (sim.dragging) {
        sim.dragMoved = true; sim.dragging.x = p.x; sim.dragging.y = p.y
        sim.frame = Math.min(sim.frame, 140); sim.running = true; sim.loop()
        redraw(); setTip({ label: sim.dragging.label, detail: sim.dragging.detail, x: p.x, y: p.y }); return
      }
      const n = hitTest(sim.nodes, p.x, p.y)
      if (n?.id !== sim.hoveredId) { sim.hoveredId = n?.id ?? null; onNodeHover?.(n ?? null); redraw() }
      if (n) { cvs.style.cursor = "pointer"; setTip({ label: n.label, detail: n.detail, x: p.x, y: p.y }) }
      else { cvs.style.cursor = "default"; setTip(null) }
    }
    const onUp = () => { sim.dragging = null; cvs.style.cursor = sim.hoveredId ? "pointer" : "default" }
    const onLeave = () => { if (!sim.dragging) { sim.hoveredId = null; onNodeHover?.(null); setTip(null); redraw() } }
    const onClick = (e: MouseEvent) => { if (sim.dragMoved) return; const p = pt(e), n = hitTest(sim.nodes, p.x, p.y); if (n) onNodeClick?.(n) }
    cvs.addEventListener("mousedown", onDown); cvs.addEventListener("mousemove", onMove)
    cvs.addEventListener("mouseleave", onLeave); cvs.addEventListener("click", onClick)
    document.addEventListener("mouseup", onUp)
    return () => {
      cvs.removeEventListener("mousedown", onDown); cvs.removeEventListener("mousemove", onMove)
      cvs.removeEventListener("mouseleave", onLeave); cvs.removeEventListener("click", onClick)
      document.removeEventListener("mouseup", onUp)
    }
  }, [onNodeClick, onNodeHover, redraw, sim])

  return (
    <div ref={wrapRef} className={cn(socialGraphWrap({ size: size as SocialGraphSize }), className)} {...rest}>
      <canvas ref={cvsRef} role="img" aria-label={`Social graph: ${inputNodes.length} nodes, ${inputEdges.length} connections`}
        tabIndex={0} className="block touch-none" />
      {tip && (
        <div className="pointer-events-none absolute z-10 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md transition-opacity"
          style={{ left: Math.max(6, tip.x - 60), top: Math.max(6, tip.y - 48) }}>
          <div className="font-medium">{tip.label}</div>
          {tip.detail && <div className="text-muted-foreground">{tip.detail}</div>}
        </div>
      )}
      <ul className="sr-only" aria-label="Graph nodes">
        {inputNodes.map((n) => (<li key={n.id}>{n.label}{n.group ? ` (${n.group})` : ""}</li>))}
      </ul>
    </div>
  )
}

export { MnSocialGraph, socialGraphWrap }
