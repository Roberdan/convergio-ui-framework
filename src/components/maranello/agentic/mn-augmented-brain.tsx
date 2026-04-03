"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────────── */
export interface BrainNode {
  id: string
  label: string
  type: "core" | "memory" | "skill" | "sense"
  active?: boolean
}

export interface BrainConnection {
  from: string
  to: string
  strength: number
}

/* ── CVA ───────────────────────────────────────────────────── */
const brainWrap = cva("relative block", {
  variants: {
    size: {
      sm: "max-w-xs",
      md: "max-w-md",
      lg: "max-w-xl",
      fluid: "w-full",
    },
  },
  defaultVariants: { size: "md" },
})

/* ── Props ─────────────────────────────────────────────────── */
export interface MnAugmentedBrainProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof brainWrap> {
  nodes: BrainNode[]
  connections: BrainConnection[]
  onNodeClick?: (node: BrainNode) => void
  ariaLabel?: string
  height?: number
}

/* ── Constants & helpers ───────────────────────────────────── */
const LAYER_ORDER: BrainNode["type"][] = ["core", "memory", "skill", "sense"]

const NODE_TOKENS: Record<BrainNode["type"], [string, string]> = {
  core: ["--primary", "#6366f1"],
  memory: ["--chart-2", "#22c55e"],
  skill: ["--chart-3", "#f59e0b"],
  sense: ["--chart-4", "#8b5cf6"],
}

const FONT = "10px Inter, system-ui, sans-serif"

interface NodePos { node: BrainNode; x: number; y: number; r: number }

function resolveColor(el: Element, token: string, fallback: string): string {
  const v = getComputedStyle(el).getPropertyValue(token).trim()
  if (!v) return fallback
  return v.startsWith("#") || v.startsWith("rgb") || v.startsWith("hsl") ? v : `hsl(${v})`
}

function computeLayout(nodes: BrainNode[], w: number, h: number): NodePos[] {
  if (!nodes.length) return []
  const cx = w / 2, cy = h / 2, base = Math.min(w, h)
  const out: NodePos[] = []
  for (const layer of LAYER_ORDER) {
    const ln = nodes.filter((n) => n.type === layer)
    if (!ln.length) continue
    if (layer === "core") {
      const gap = ln.length > 1 ? (2 * Math.PI) / ln.length : 0
      const rad = ln.length > 1 ? base * 0.06 : 0
      for (let i = 0; i < ln.length; i++) {
        const a = gap * i - Math.PI / 2
        out.push({ node: ln[i], x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a), r: base * 0.045 })
      }
    } else {
      const li = LAYER_ORDER.indexOf(layer)
      const radius = base * (0.15 + li * 0.12)
      const step = (2 * Math.PI) / ln.length, off = li * 0.4
      for (let i = 0; i < ln.length; i++) {
        const a = step * i - Math.PI / 2 + off
        out.push({ node: ln[i], x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a), r: base * 0.032 })
      }
    }
  }
  return out
}

/* ── Canvas drawing ────────────────────────────────────────── */
function drawFrame(
  ctx: CanvasRenderingContext2D, w: number, h: number, positions: NodePos[],
  connections: BrainConnection[], hovId: string | null, pulse: number, el: Element,
): void {
  if (w < 40 || h < 40) return;
  ctx.clearRect(0, 0, w, h)
  const posMap = new Map(positions.map((p) => [p.node.id, p]))
  const rc = (t: string, fb: string) => resolveColor(el, t, fb)
  const fg = rc("--foreground", "#fafafa"), muted = rc("--muted-foreground", "#888")
  const ringC = rc("--ring", "#888"), cardBg = rc("--card", "#1a1a1a"), borderC = rc("--border", "#3a3a3a")

  for (const conn of connections) {
    const from = posMap.get(conn.from), to = posMap.get(conn.to)
    if (!from || !to) continue
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y)
    ctx.strokeStyle = muted; ctx.lineWidth = 1 + conn.strength * 2
    ctx.globalAlpha = 0.15 + conn.strength * 0.4; ctx.stroke(); ctx.globalAlpha = 1
    if (from.node.active || to.node.active) {
      const px = from.x + (to.x - from.x) * pulse, py = from.y + (to.y - from.y) * pulse
      ctx.beginPath(); ctx.arc(px, py, 2 + conn.strength * 2, 0, Math.PI * 2)
      ctx.fillStyle = rc(NODE_TOKENS[from.node.type][0], NODE_TOKENS[from.node.type][1])
      ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1
    }
  }
  for (const pos of positions) {
    const color = rc(NODE_TOKENS[pos.node.type][0], NODE_TOKENS[pos.node.type][1])
    if (pos.node.active) {
      const gr = pos.r + 6 + Math.sin(pulse * Math.PI * 2) * 4
      ctx.beginPath(); ctx.arc(pos.x, pos.y, gr, 0, Math.PI * 2)
      ctx.fillStyle = color; ctx.globalAlpha = 0.15; ctx.fill(); ctx.globalAlpha = 1
    }
    if (pos.node.id === hovId) {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, pos.r + 4, 0, Math.PI * 2)
      ctx.strokeStyle = ringC; ctx.lineWidth = 2; ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2)
    ctx.fillStyle = color; ctx.globalAlpha = pos.node.active ? 1 : 0.5
    ctx.fill(); ctx.globalAlpha = 1
    ctx.font = FONT; ctx.textAlign = "center"; ctx.fillStyle = fg
    ctx.fillText(pos.node.label, pos.x, pos.y + pos.r + 14)
  }
  const hp = hovId ? posMap.get(hovId) : undefined
  if (hp) {
    const lbl = `${hp.node.label} (${hp.node.type}${hp.node.active ? ", active" : ""})`
    ctx.font = FONT
    const tw = ctx.measureText(lbl).width + 12
    const tx = Math.min(Math.max(hp.x - tw / 2, 4), w - tw - 4)
    const ty = Math.max(hp.y - hp.r - 28, 4)
    ctx.fillStyle = cardBg; ctx.fillRect(tx, ty, tw, 20)
    ctx.strokeStyle = borderC; ctx.lineWidth = 1; ctx.strokeRect(tx, ty, tw, 20)
    ctx.fillStyle = fg; ctx.textAlign = "left"; ctx.fillText(lbl, tx + 6, ty + 14)
  }
}

/* ── Component ─────────────────────────────────────────────── */
export function MnAugmentedBrain({
  nodes, connections, onNodeClick,
  ariaLabel = "AI brain visualization",
  height = 400, size = "md", className, ...rest
}: MnAugmentedBrainProps) {
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const wrap = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef(0)
  const hovRef = React.useRef<string | null>(null)
  const posRef = React.useRef<NodePos[]>([])

  React.useEffect(() => {
    const canvas = cvs.current, host = wrap.current
    if (!canvas || !host) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setup = () => {
      const dpr = window.devicePixelRatio || 1
      const w = Math.max(host.clientWidth || 320, 200)
      canvas.width = w * dpr; canvas.height = height * dpr
      canvas.style.width = `${w}px`; canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      posRef.current = computeLayout(nodes ?? [], w, height)
    }
    setup()
    const t0 = performance.now()
    const loop = (now: number) => {
      const elapsed = (now - t0) / 2000
      const pulse = elapsed - Math.floor(elapsed)
      const lw = canvas.clientWidth || 320, lh = canvas.clientHeight || height
      drawFrame(ctx, lw, lh, posRef.current, connections ?? [], hovRef.current, pulse, host)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(setup) : null
    ro?.observe(host)
    return () => { cancelAnimationFrame(raf.current); ro?.disconnect() }
  }, [nodes, connections, height])

  const hitTest = React.useCallback((mx: number, my: number): BrainNode | null => {
    for (let i = posRef.current.length - 1; i >= 0; i--) {
      const p = posRef.current[i]
      if (Math.hypot(mx - p.x, my - p.y) <= p.r + 3) return p.node
    }
    return null
  }, [])

  const coords = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = cvs.current?.getBoundingClientRect()
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : null
  }, [])

  const handleMove = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = coords(e); if (!c) return
    const nid = hitTest(c.x, c.y)?.id ?? null
    if (nid !== hovRef.current) {
      hovRef.current = nid
      if (cvs.current) cvs.current.style.cursor = nid ? "pointer" : "default"
    }
  }, [hitTest, coords])

  const handleClick = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick) return
    const c = coords(e); if (!c) return
    const hit = hitTest(c.x, c.y)
    if (hit) onNodeClick(hit)
  }, [onNodeClick, hitTest, coords])

  const handleLeave = React.useCallback(() => { hovRef.current = null }, [])

  const ariaDesc = React.useMemo(() => {
    const safe = nodes ?? []
    const counts = LAYER_ORDER.map((t) => {
      const c = safe.filter((n) => n.type === t).length
      return c > 0 ? `${c} ${t}` : null
    }).filter(Boolean)
    return ariaLabel ?? `Brain visualization: ${safe.length} nodes (${counts.join(", ")})`
  }, [nodes, ariaLabel])

  return (
    <div ref={wrap} className={cn(brainWrap({ size }), className)} {...rest}>
      <canvas
        ref={cvs} role="img" aria-label={ariaDesc} className="block w-full"
        onClick={handleClick} onMouseMove={handleMove} onMouseLeave={handleLeave}
        tabIndex={0}
      />
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground" aria-label="Node type legend">
        {LAYER_ORDER.map((type) => (
          <span key={type} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: `hsl(var(${NODE_TOKENS[type][0]}))` }}
            />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>
    </div>
  )
}

export { brainWrap }
