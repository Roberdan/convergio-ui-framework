/**
 * Maranello Neural Nodes – canvas drawing routines and label rendering.
 */
import type { InternalNode, DrawState } from "./mn-neural-nodes-types"

const MAX_LABEL_CHARS = 25
const BADGE_PAD_H = 6
const BADGE_PAD_V = 2
const BADGE_RADIUS = 4

export function toAlpha(color: string, opacity: number): string {
  const full = color.replace("#", "").replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3")
  const v = parseInt(full, 16)
  if (Number.isNaN(v)) return `rgba(255,199,44,${opacity})`
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${opacity})`
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  now: number,
  s: DrawState,
): void {
  const w = ctx.canvas.clientWidth || 1
  const h = ctx.canvas.clientHeight || 1
  ctx.clearRect(0, 0, w, h)

  // Connections
  for (const l of s.connections) {
    const a = s.nodes[l.a]
    const b = s.nodes[l.b]
    if (!a || !b) continue
    const em = s.hovered === l.a || s.hovered === l.b
    const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
    const baseA = l.strength * 0.5
    g.addColorStop(0, toAlpha(a.color, em ? 0.48 : baseA + a.energy * 0.18))
    g.addColorStop(0.55, toAlpha(b.color, 0.18 + Math.max(a.energy, b.energy) * 0.16))
    g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.strokeStyle = g
    ctx.lineWidth = em ? 2 : 0.6 + l.strength * 1.2
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  // Particles
  const visLanes = Math.max(1, Math.round(s.particleCount * (0.3 + s.activity * 0.7)))
  for (const p of s.particles) {
    if (p.lane >= visLanes) continue
    const l = s.connections[p.connection]
    if (!l) continue
    const a = s.nodes[l.a]
    const b = s.nodes[l.b]
    if (!a || !b) continue
    const x = a.x + (b.x - a.x) * p.t
    const y = a.y + (b.y - a.y) * p.t
    ctx.save()
    ctx.fillStyle = toAlpha(a.color, 0.65 + s.activity * 0.25)
    ctx.shadowColor = a.color
    ctx.shadowBlur = 6 + s.activity * 8
    ctx.beginPath()
    ctx.arc(x, y, 1.6 + s.activity * 1.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Waves
  for (const wv of s.waves) {
    ctx.save()
    ctx.strokeStyle = toAlpha(wv.color, wv.life * 0.65)
    ctx.lineWidth = 1.5 + wv.life * 2
    ctx.shadowColor = wv.color
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(wv.x, wv.y, Math.max(0, wv.radius), 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // Nodes
  for (let i = 0; i < s.nodes.length; i++) {
    const n = s.nodes[i]
    const sz = n.size * 8
    const pulse = Math.max(0,
      sz * 0.3 +
      Math.sin(now * 0.002 * s.pulseSpeed + n.phase) * 1.4 +
      n.energy * 3.2 +
      (s.hovered === i ? 2 : 0)
    )
    ctx.save()
    ctx.fillStyle = toAlpha(n.color, 0.2)
    ctx.shadowColor = n.color
    ctx.shadowBlur = 12 + n.energy * 12
    ctx.beginPath()
    ctx.arc(n.x, n.y, pulse + 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = n.color
    ctx.beginPath()
    ctx.arc(n.x, n.y, pulse, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  if (s.labels) drawLabels(ctx, s.nodes, s.hovered, s.labelFont)
}

/* ── Label rendering ───────────────────────────────────────── */

function truncate(text: string): string {
  return text.length > MAX_LABEL_CHARS
    ? text.slice(0, MAX_LABEL_CHARS - 1) + "\u2026"
    : text
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  nodes: InternalNode[],
  hovered: number,
  fontBase: string,
): void {
  ctx.textAlign = "center"
  ctx.textBaseline = "top"

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    if (!n.label) continue
    const visible = n.energy > 0.3 || i === hovered
    if (!visible) continue

    const fade = i === hovered ? 1 : Math.min(1, (n.energy - 0.3) * 2.5)
    const baseSize = n.size * 8
    let yOff = baseSize + 6

    ctx.font = `bold 10px ${fontBase}`
    ctx.fillStyle = toAlpha("#ffffff", 0.92 * fade)
    ctx.fillText(truncate(n.label), n.x, n.y + yOff)
    yOff += 13

    if (n.sublabel) {
      ctx.font = `9px ${fontBase}`
      ctx.fillStyle = toAlpha("#c8c8c8", 0.7 * fade)
      ctx.fillText(truncate(n.sublabel), n.x, n.y + yOff)
      yOff += 12
    }

    if (n.badge) {
      drawBadge(ctx, n.x, n.y + yOff, n.badge, n.color, fade, fontBase)
    }
  }
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
  color: string,
  fade: number,
  fontBase: string,
): void {
  ctx.font = `bold 8px ${fontBase}`
  const m = ctx.measureText(text)
  const w = m.width + BADGE_PAD_H * 2
  const h = 12 + BADGE_PAD_V * 2
  const x = cx - w / 2
  const y = cy

  ctx.save()
  ctx.globalAlpha = 0.75 * fade
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, BADGE_RADIUS)
  ctx.fill()
  ctx.globalAlpha = fade
  ctx.fillStyle = "#000000"
  ctx.textBaseline = "middle"
  ctx.fillText(text, cx, y + h / 2)
  ctx.restore()
}
