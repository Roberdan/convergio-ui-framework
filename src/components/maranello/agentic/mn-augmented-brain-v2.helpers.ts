/**
 * Maranello Augmented Brain V2 – shared types & drawing helpers.
 */

/* ── Types ─────────────────────────────────────────────────── */
export interface BrainV2Node {
  id: string
  label: string
  type: "hub" | "agent" | "task" | "plan"
  status?: "active" | "idle" | "completed" | "error"
  size?: number
}

export interface BrainV2Synapse {
  from: string
  to: string
  strength: number
  active?: boolean
}

export interface BrainV2Stats {
  sessions?: number
  plans?: number
  tasks?: number
  synapses?: number
}

export interface BrainV2Palette {
  hub: string
  agent: string
  task: string
  plan: string
  text: string
  muted: string
  accent: string
  surface: string
  border: string
  error: string
}

/* ── Internal layout types ────────────────────────────────── */
export interface NodePos {
  node: BrainV2Node
  x: number
  y: number
  r: number
}

export interface SynapseParticle {
  synIdx: number
  t: number
  speed: number
}

/* ── Palette reader ─────────────────────────────────────────  */
function rc(el: Element, token: string, fb: string): string {
  const v = getComputedStyle(el).getPropertyValue(token).trim()
  if (!v) return fb
  return v.startsWith("#") || v.startsWith("rgb") || v.startsWith("hsl")
    ? v
    : `hsl(${v})`
}

export function readBrainV2Palette(el: Element): BrainV2Palette {
  return {
    hub: rc(el, "--primary", "#6366f1"),
    agent: rc(el, "--chart-3", "#f59e0b"),
    task: rc(el, "--chart-2", "#22c55e"),
    plan: rc(el, "--chart-4", "#8b5cf6"),
    text: rc(el, "--mn-text", "#fafafa"),
    muted: rc(el, "--mn-text-muted", "#888"),
    accent: rc(el, "--mn-accent", "#FFC72C"),
    surface: rc(el, "--mn-surface", "#1a1a1a"),
    border: rc(el, "--mn-border", "#3a3a3a"),
    error: rc(el, "--destructive", "#ef4444"),
  }
}

/* ── Layout computation ────────────────────────────────────── */
export function computeV2Layout(
  nodes: BrainV2Node[],
  w: number,
  h: number,
): NodePos[] {
  if (!nodes.length) return []
  const cx = w / 2
  const cy = h / 2
  const base = Math.min(w, h)
  const out: NodePos[] = []

  const hubs = nodes.filter((n) => n.type === "hub")
  const rest = nodes.filter((n) => n.type !== "hub")

  for (const hub of hubs) {
    const r = base * 0.08 * (hub.size ?? 1)
    out.push({ node: hub, x: cx, y: cy, r: Math.max(r, 16) })
  }

  if (rest.length) {
    const ring = base * 0.32
    const step = (2 * Math.PI) / rest.length
    for (let i = 0; i < rest.length; i++) {
      const a = step * i - Math.PI / 2
      const r = base * 0.015 * (rest[i].size ?? 1)
      out.push({
        node: rest[i],
        x: cx + ring * Math.cos(a),
        y: cy + ring * Math.sin(a),
        r: Math.max(r, 4),
      })
    }
  }
  return out
}

/* ── Node color by type ────────────────────────────────────── */
export function nodeColorV2(node: BrainV2Node, pal: BrainV2Palette): string {
  if (node.status === "error") return pal.error
  return pal[node.type]
}

/* ── Draw frame ────────────────────────────────────────────── */
const FONT = "10px 'Barlow Condensed', system-ui, sans-serif"

export function drawBrainV2Frame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  positions: NodePos[],
  synapses: BrainV2Synapse[],
  particles: SynapseParticle[],
  hovId: string | null,
  pal: BrainV2Palette,
): void {
  if (w < 40 || h < 40) return
  ctx.clearRect(0, 0, w, h)
  const posMap = new Map(positions.map((p) => [p.node.id, p]))

  for (const syn of synapses) {
    const from = posMap.get(syn.from)
    const to = posMap.get(syn.to)
    if (!from || !to) continue
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.strokeStyle = pal.muted
    ctx.lineWidth = 1 + syn.strength * 1.5
    ctx.globalAlpha = 0.1 + syn.strength * 0.35
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  for (const p of particles) {
    const syn = synapses[p.synIdx]
    if (!syn) continue
    const from = posMap.get(syn.from)
    const to = posMap.get(syn.to)
    if (!from || !to) continue
    const px = from.x + (to.x - from.x) * p.t
    const py = from.y + (to.y - from.y) * p.t
    ctx.beginPath()
    ctx.arc(px, py, 2, 0, Math.PI * 2)
    ctx.fillStyle = pal.accent
    ctx.globalAlpha = 0.7
    ctx.fill()
    ctx.globalAlpha = 1
  }

  for (const pos of positions) {
    const color = nodeColorV2(pos.node, pal)
    if (pos.node.type === "hub") {
      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pos.r * 1.5)
      grad.addColorStop(0, color)
      grad.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, pos.r * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.globalAlpha = 0.3
      ctx.fill()
      ctx.globalAlpha = 1
    }

    if (pos.node.id === hovId) {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, pos.r + 4, 0, Math.PI * 2)
      ctx.strokeStyle = pal.accent
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.globalAlpha = pos.node.status === "idle" || pos.node.status === "completed" ? 0.5 : 1
    ctx.fill()
    ctx.globalAlpha = 1

    ctx.font = FONT
    ctx.textAlign = "center"
    ctx.fillStyle = pal.text
    const maxLabelW = 90
    let lbl = pos.node.label
    if (ctx.measureText(lbl).width > maxLabelW) {
      while (lbl.length > 3 && ctx.measureText(lbl + "...").width > maxLabelW) {
        lbl = lbl.slice(0, -1)
      }
      lbl += "..."
    }
    ctx.fillText(lbl, pos.x, pos.y + pos.r + 14)
  }

  const hp = hovId ? posMap.get(hovId) : undefined
  if (hp) {
    const lbl = `${hp.node.label} (${hp.node.type})`
    ctx.font = FONT
    const tw = ctx.measureText(lbl).width + 12
    const tx = Math.min(Math.max(hp.x - tw / 2, 4), w - tw - 4)
    const ty = Math.max(hp.y - hp.r - 28, 4)
    ctx.fillStyle = pal.surface
    ctx.fillRect(tx, ty, tw, 20)
    ctx.strokeStyle = pal.border
    ctx.lineWidth = 1
    ctx.strokeRect(tx, ty, tw, 20)
    ctx.fillStyle = pal.text
    ctx.textAlign = "left"
    ctx.fillText(lbl, tx + 6, ty + 14)
  }
}
