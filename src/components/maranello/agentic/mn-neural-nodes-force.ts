/**
 * Maranello Neural Nodes – force-directed layout simulation.
 */
import type {
  InternalNode, InternalConnection, Activation,
} from "./mn-neural-nodes-types"

const REPULSION = 4000
const ATTRACTION = 0.008
const GROUP_GRAVITY = 0.003
const DAMPING = 0.88
const MAX_SPEED = 2.5

export function applyForces(
  nodes: InternalNode[],
  connections: InternalConnection[],
  width: number,
  height: number,
): void {
  const cx = width / 2
  const cy = height / 2
  const groupCenters = computeGroupCenters(nodes)

  for (let i = 0; i < nodes.length; i++) {
    let fx = 0
    let fy = 0
    const ni = nodes[i]

    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue
      const nj = nodes[j]
      const dx = ni.x - nj.x
      const dy = ni.y - nj.y
      const dist = Math.max(1, Math.hypot(dx, dy))
      const force = REPULSION / (dist * dist)
      fx += (dx / dist) * force
      fy += (dy / dist) * force
    }

    fx += (cx - ni.x) * 0.0002
    fy += (cy - ni.y) * 0.0002

    if (ni.group && groupCenters.has(ni.group)) {
      const gc = groupCenters.get(ni.group)!
      fx += (gc.x - ni.x) * GROUP_GRAVITY
      fy += (gc.y - ni.y) * GROUP_GRAVITY
    }

    ni.vx = (ni.vx + fx) * DAMPING
    ni.vy = (ni.vy + fy) * DAMPING
  }

  for (const conn of connections) {
    const a = nodes[conn.a]
    const b = nodes[conn.b]
    if (!a || !b) continue
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dist = Math.hypot(dx, dy)
    const force = (dist - 80) * ATTRACTION * (conn.strength ?? 0.5)
    const nx = dx / Math.max(1, dist)
    const ny = dy / Math.max(1, dist)
    a.vx += nx * force
    a.vy += ny * force
    b.vx -= nx * force
    b.vy -= ny * force
  }

  const pad = 28
  for (const n of nodes) {
    n.vx = clampSpeed(n.vx)
    n.vy = clampSpeed(n.vy)
    n.x += n.vx
    n.y += n.vy
    if (n.x < pad) { n.x = pad; n.vx *= -0.5 }
    if (n.x > width - pad) { n.x = width - pad; n.vx *= -0.5 }
    if (n.y < pad) { n.y = pad; n.vy *= -0.5 }
    if (n.y > height - pad) { n.y = height - pad; n.vy *= -0.5 }
  }
}

function clampSpeed(v: number): number {
  return Math.max(-MAX_SPEED, Math.min(MAX_SPEED, v))
}

function computeGroupCenters(
  nodes: InternalNode[],
): Map<string, { x: number; y: number }> {
  const sums = new Map<string, { sx: number; sy: number; count: number }>()
  for (const n of nodes) {
    if (!n.group) continue
    const entry = sums.get(n.group) ?? { sx: 0, sy: 0, count: 0 }
    entry.sx += n.x
    entry.sy += n.y
    entry.count++
    sums.set(n.group, entry)
  }
  const centers = new Map<string, { x: number; y: number }>()
  sums.forEach(({ sx, sy, count }, group) => {
    centers.set(group, { x: sx / count, y: sy / count })
  })
  return centers
}

export function triggerPulse(
  target: number | string | undefined,
  nodes: InternalNode[],
  connections: InternalConnection[],
  activations: Activation[],
): void {
  let nodeIndex: number
  if (typeof target === "string") {
    const idx = nodes.findIndex((n) => n.id === target)
    nodeIndex = idx >= 0 ? idx : Math.floor(Math.random() * nodes.length)
  } else {
    nodeIndex = target ?? Math.floor(Math.random() * nodes.length)
  }
  if (!nodes[nodeIndex]) return
  const graph = Array.from({ length: nodes.length }, () => [] as number[])
  connections.forEach((l) => { graph[l.a].push(l.b); graph[l.b].push(l.a) })
  const queue: Array<[number, number]> = [[nodeIndex, 0]]
  const seen = new Set<number>([nodeIndex])
  const start = performance.now()
  while (queue.length) {
    const [idx, hop] = queue.shift()!
    activations.push({ at: start + hop * 100, index: idx })
    graph[idx].forEach((next) => {
      if (!seen.has(next)) { seen.add(next); queue.push([next, hop + 1]) }
    })
  }
}
