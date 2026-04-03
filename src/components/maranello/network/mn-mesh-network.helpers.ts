import type { MeshNode, MeshEdge } from "./mn-mesh-network"

/* ── Internal types ────────────────────────────────────────── */
export interface NodePos { x: number; y: number; pulsePhase: number; established: number }
export interface Particle { edgeIdx: number; progress: number; speed: number; size: number; trail: { x: number; y: number }[] }
export interface EdgeAnim { established: number }
export interface Palette {
  surface: string; surfaceRaised: string; border: string
  text: string; textMuted: string; accent: string
  ok: string; warning: string; danger: string
}

/* ── Helpers ───────────────────────────────────────────────── */
function cssv(el: Element, n: string, fb: string): string {
  return getComputedStyle(el).getPropertyValue(n).trim() || fb
}

export function readPalette(el: Element): Palette {
  const g = (n: string, fb: string) => cssv(el, n, fb)
  return {
    surface: g("--mn-surface", "#0d0d0d"), surfaceRaised: g("--mn-surface-raised", "#1a1a1a"),
    border: g("--mn-border", "#3a3a3a"), text: g("--mn-text", "#fafafa"),
    textMuted: g("--mn-text-muted", "#888"), accent: g("--mn-accent", "#DC0000"),
    ok: g("--signal-ok", "#00A651"), warning: g("--signal-warning", "#FFC72C"),
    danger: g("--signal-danger", "#DC0000"),
  }
}

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t }

function hexToRgba(hex: string, a: number): string {
  const c = hex.replace("#", "")
  const full = c.length === 3 ? c.replace(/./g, "$&$&") : c
  const v = parseInt(full, 16)
  if (Number.isNaN(v)) return `rgba(128,128,128,${a})`
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`
}

const STATUS_KEY: Record<string, "ok" | "warning" | "danger"> = {
  online: "ok", degraded: "warning", offline: "danger",
}
const TYPE_RADIUS: Record<string, number> = { coordinator: 18, worker: 13, kernel: 15, relay: 11 }

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2)
}

/* ── Layout ────────────────────────────────────────────────── */
export function circleLayout(count: number, cx: number, cy: number, r: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
}

/* ── Canvas setup ──────────────────────────────────────────── */
export function setupCanvas(cvs: HTMLCanvasElement, w: number, h: number): void {
  const dpr = window.devicePixelRatio || 1
  cvs.width = w * dpr; cvs.height = h * dpr
  cvs.style.width = `${w}px`; cvs.style.height = `${h}px`
  cvs.getContext("2d")?.scale(dpr, dpr)
}

/* ── Spawn particles ───────────────────────────────────────── */
export function maybeSpawnParticle(
  particles: Particle[], edges: MeshEdge[], nodes: MeshNode[], maxP: number,
): void {
  if (particles.length >= maxP || Math.random() > 0.02) return
  const ids = new Set(nodes.filter((n) => n.status === "online").map((n) => n.id))
  const valid = edges.map((e, i) => ({ e, i })).filter(({ e }) => ids.has(e.from) && ids.has(e.to))
  if (!valid.length) return
  const pick = valid[Math.floor(Math.random() * valid.length)]
  particles.push({ edgeIdx: pick.i, progress: 0, speed: 0.3 + Math.random() * 0.5, size: 2.5 + Math.random() * 1.5, trail: [] })
}

/* ── Frame renderer ────────────────────────────────────────── */
export function drawFrame(
  ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, now: number,
  nodes: MeshNode[], edges: MeshEdge[], positions: Map<string, NodePos>,
  particles: Particle[], edgeAnims: EdgeAnim[], selectedId: string | null, p: Palette,
): void {
  ctx.clearRect(0, 0, w, h)

  // Edges with connection establishment animation
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i], from = positions.get(edge.from), to = positions.get(edge.to)
    const anim = edgeAnims[i]
    if (!from || !to || !anim) continue
    anim.established = Math.min(1, anim.established + dt * 0.0015)
    if (anim.established <= 0) continue
    const active = selectedId === edge.from || selectedId === edge.to
    ctx.save()
    ctx.strokeStyle = hexToRgba(active ? p.accent : p.border, active ? 0.7 : 0.3)
    ctx.lineWidth = active ? 2.5 : 1.2
    if (edge.latency != null && edge.latency > 100) ctx.setLineDash([6, 4])
    ctx.beginPath(); ctx.moveTo(from.x, from.y)
    ctx.lineTo(lerp(from.x, to.x, anim.established), lerp(from.y, to.y, anim.established))
    ctx.stroke(); ctx.setLineDash([]); ctx.restore()
    if (edge.latency != null && anim.established >= 1) {
      ctx.save(); ctx.font = "500 10px Inter,sans-serif"; ctx.textAlign = "center"
      ctx.fillStyle = hexToRgba(p.textMuted, 0.8)
      ctx.fillText(`${edge.latency}ms`, (from.x + to.x) / 2, (from.y + to.y) / 2 - 8)
      ctx.restore()
    }
  }

  // Data-flow particles along edges
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i], edge = edges[pt.edgeIdx]
    if (!edge) { particles.splice(i, 1); continue }
    const from = positions.get(edge.from), to = positions.get(edge.to)
    if (!from || !to) { particles.splice(i, 1); continue }
    pt.progress += (dt / 2000) * pt.speed
    const x = lerp(from.x, to.x, pt.progress), y = lerp(from.y, to.y, pt.progress)
    pt.trail.push({ x, y }); if (pt.trail.length > 8) pt.trail.shift()
    for (let j = 0; j < pt.trail.length; j++) {
      const tp = pt.trail[j]
      ctx.save(); ctx.fillStyle = hexToRgba(p.accent, ((j + 1) / pt.trail.length) * 0.35)
      disc(ctx, tp.x, tp.y, pt.size * (0.4 + (j / pt.trail.length) * 0.6))
      ctx.fill(); ctx.restore()
    }
    ctx.save(); ctx.shadowColor = p.accent; ctx.shadowBlur = pt.size * 3
    ctx.fillStyle = hexToRgba(p.accent, 0.9)
    disc(ctx, x, y, pt.size); ctx.fill(); ctx.restore()
    if (pt.progress >= 1) particles.splice(i, 1)
  }

  // Nodes with pulse/glow effects
  for (const node of nodes) {
    const pos = positions.get(node.id)
    if (!pos) continue
    const r = TYPE_RADIUS[node.type] ?? 13
    const sc = p[STATUS_KEY[node.status] ?? "ok"], off = node.status === "offline"
    if (!off) {
      const pulse = Math.sin(now * 0.003 + pos.pulsePhase) * 0.5 + 0.5
      ctx.save(); ctx.strokeStyle = hexToRgba(sc, 0.08 + pulse * 0.12); ctx.lineWidth = 1.5
      disc(ctx, pos.x, pos.y, r + 4 + pulse * 6); ctx.stroke(); ctx.restore()
      ctx.save(); ctx.shadowColor = sc; ctx.shadowBlur = r * 0.8
      ctx.fillStyle = hexToRgba(sc, 0.12)
      disc(ctx, pos.x, pos.y, r * 1.5); ctx.fill(); ctx.restore()
    }
    if (selectedId === node.id) {
      ctx.save(); ctx.strokeStyle = hexToRgba(p.accent, 0.8); ctx.lineWidth = 2
      disc(ctx, pos.x, pos.y, r + 4); ctx.stroke(); ctx.restore()
    }
    ctx.save()
    if (!off) { ctx.shadowColor = sc; ctx.shadowBlur = r * 0.6 }
    ctx.fillStyle = hexToRgba(sc, off ? 0.3 : 0.85)
    disc(ctx, pos.x, pos.y, r); ctx.fill(); ctx.restore()
    ctx.save(); ctx.font = "500 11px Inter,sans-serif"; ctx.textAlign = "center"
    ctx.fillStyle = hexToRgba(p.text, 0.9)
    ctx.fillText(node.label, pos.x, pos.y + r + 16); ctx.restore()
  }
}
