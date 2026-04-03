/**
 * Maranello Neural Nodes – shared type definitions.
 */

export interface NeuralNodeData {
  id: string
  label?: string
  sublabel?: string
  color?: string
  size?: number
  group?: string
  badge?: string
  energy?: number
}

export interface NeuralConnection {
  from: string
  to: string
  strength?: number
}

export interface InternalNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  color: string
  phase: number
  energy: number
  size: number
  label?: string
  sublabel?: string
  badge?: string
  group?: string
}

export interface InternalConnection {
  a: number
  b: number
  strength: number
}

export interface Particle {
  connection: number
  lane: number
  t: number
  speed: number
}

export interface Wave {
  x: number
  y: number
  radius: number
  life: number
  color: string
}

export interface Activation {
  at: number
  index: number
}

export interface DrawState {
  nodes: InternalNode[]
  connections: InternalConnection[]
  particles: Particle[]
  waves: Wave[]
  hovered: number
  activity: number
  pulseSpeed: number
  particleCount: number
  labels: boolean
  labelFont: string
}

export interface NeuralNodesController {
  pulse: (target?: number | string) => void
  setActivity: (level: number) => void
  highlightNode: (id: string | null) => void
}

const GROUP_COLORS: Record<string, string> = {
  claude: "var(--mn-accent, #FFC72C)",
  copilot: "var(--mn-info, #4EA8DE)",
}

export function toInternal(
  nd: NeuralNodeData, w: number, h: number, colors: string[],
): InternalNode {
  const color = nd.color
    ?? (nd.group ? GROUP_COLORS[nd.group] : undefined)
    ?? colors[0]
  return {
    id: nd.id,
    x: 24 + Math.random() * (w - 48),
    y: 24 + Math.random() * (h - 48),
    vx: 0, vy: 0, color,
    phase: Math.random() * Math.PI * 2,
    energy: nd.energy ?? Math.random() * 0.4,
    size: nd.size ?? 1,
    label: nd.label, sublabel: nd.sublabel,
    badge: nd.badge, group: nd.group,
  }
}
