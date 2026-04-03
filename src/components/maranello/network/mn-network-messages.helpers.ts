import type { NetNode, NetConnection, NetMessage } from "./mn-network-messages"

/* ── Internal types ────────────────────────────────────────── */
export type ActiveMsg = NetMessage & {
  progress: number; speed: number; size: number
  trail: { x: number; y: number }[]
}
export type Flash = {
  x: number; y: number; radius: number; life: number; color: string
}
export interface DrawOpts {
  trail: boolean; glow: boolean
  nodeColor: string; accent: string; label: string; bg: string
}

/* ── Helpers ───────────────────────────────────────────────── */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function colorAlpha(color: string, opacity: number): string {
  if (color.startsWith("rgba(")) return color.replace(/[\d.]+\)$/, `${opacity})`)
  if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `,${opacity})`)
  const hex = color.replace("#", "")
  const full = hex.length === 3 ? hex.replace(/./g, "$&$&") : hex
  const v = parseInt(full, 16)
  if (Number.isNaN(v)) return `rgba(78,168,222,${opacity})`
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${opacity})`
}

export function setupCanvas(cvs: HTMLCanvasElement, w: number, h: number): void {
  const dpr = window.devicePixelRatio || 1
  cvs.width = w * dpr; cvs.height = h * dpr
  cvs.style.width = `${w}px`; cvs.style.height = `${h}px`
  cvs.getContext("2d")?.scale(dpr, dpr)
}

function drawParticle(
  ctx: CanvasRenderingContext2D, color: string,
  x: number, y: number, r: number, glow: boolean, label?: string,
): void {
  ctx.save()
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = r * 3 }
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); ctx.fill()
  if (label) {
    ctx.shadowBlur = 0; ctx.fillStyle = "#05070c"
    ctx.font = `600 ${Math.max(9, r * 2.1)}px Inter,sans-serif`
    ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillText(label.slice(0, 3), x, y + 0.5)
  }
  ctx.restore()
}

/* ── Frame renderer ────────────────────────────────────────── */
export function drawFrame(
  ctx: CanvasRenderingContext2D, w: number, h: number, dt: number,
  nodes: NetNode[], conns: NetConnection[],
  msgs: ActiveMsg[], flashes: Flash[], o: DrawOpts,
): void {
  const map = new Map(nodes.map((n) => [n.id, n]))
  const pt = (n: NetNode) => ({ x: n.x * w, y: n.y * h })

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = o.bg; ctx.fillRect(0, 0, w, h)

  // ── Edges
  for (const link of conns) {
    const f = map.get(link.from), t = map.get(link.to)
    if (!f || !t) continue
    const a = pt(f), b = pt(t)
    const active = msgs.some((m) => m.from === link.from && m.to === link.to)
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
    const dx = mx - w / 2, dy = my - h / 2, len = Math.hypot(dx, dy) || 1
    const dist = Math.hypot(b.x - a.x, b.y - a.y)
    const op = active ? 0.7 : 0.38
    ctx.save(); ctx.lineWidth = active ? 2 : 1.5
    if (active && o.glow) { ctx.shadowColor = link.color ?? o.nodeColor; ctx.shadowBlur = 8 }
    if (link.color) {
      ctx.strokeStyle = colorAlpha(link.color, op)
    } else {
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
      grad.addColorStop(0, colorAlpha(o.nodeColor, op))
      grad.addColorStop(1, colorAlpha(o.accent, op))
      ctx.strokeStyle = grad
    }
    ctx.beginPath(); ctx.moveTo(a.x, a.y)
    ctx.quadraticCurveTo(mx + (dx / len) * dist * 0.28, my + (dy / len) * dist * 0.28, b.x, b.y)
    ctx.stroke(); ctx.restore()
  }

  // ── Flashes
  for (let i = flashes.length - 1; i >= 0; i--) {
    const fl = flashes[i]
    fl.life -= dt * 0.0026; fl.radius += dt * 0.05
    if (fl.life <= 0) { flashes.splice(i, 1); continue }
    ctx.save()
    ctx.strokeStyle = colorAlpha(fl.color, fl.life * 0.75)
    ctx.lineWidth = 1.5 + fl.life * 2
    if (o.glow) { ctx.shadowColor = fl.color; ctx.shadowBlur = 10 * fl.life }
    ctx.beginPath(); ctx.arc(fl.x, fl.y, Math.max(0, fl.radius), 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }

  // ── Active messages
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i]
    const from = map.get(m.from), to = map.get(m.to)
    if (!from || !to) { msgs.splice(i, 1); continue }
    m.progress += (dt / 1500) * m.speed
    const a = pt(from), b = pt(to)
    const x = lerp(a.x, b.x, m.progress), y = lerp(a.y, b.y, m.progress)
    const c = m.color ?? to.color ?? o.accent
    if (o.trail) {
      m.trail.push({ x, y }); if (m.trail.length > 10) m.trail.shift()
      m.trail.forEach((p, idx) => {
        const r = m.size * (0.35 + idx / 18)
        drawParticle(ctx, c, p.x, p.y, r, o.glow)
        ctx.save(); ctx.globalAlpha = ((idx + 1) / m.trail.length) * 0.18
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })
    }
    if (m.progress >= 1) {
      flashes.push({ x: b.x, y: b.y, radius: 4, life: 1, color: c })
      msgs.splice(i, 1); continue
    }
    drawParticle(ctx, c, x, y, m.size, o.glow, m.label)
  }

  // ── Nodes
  for (const node of nodes) {
    const p = pt(node), s = node.size ?? 10, c = node.color ?? o.nodeColor
    ctx.save()
    if (o.glow) { ctx.shadowColor = c; ctx.shadowBlur = s * 1.4 }
    ctx.fillStyle = colorAlpha(c, 0.2)
    ctx.beginPath(); ctx.arc(p.x, p.y, s * 1.7, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = c
    ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    ctx.fillStyle = o.label; ctx.font = "600 12px Inter,sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(node.label, p.x, p.y + s + 18)
  }
}
