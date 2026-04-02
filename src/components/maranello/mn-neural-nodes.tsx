"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type {
  NeuralNodeData, NeuralConnection, InternalNode, InternalConnection,
  Particle, Wave, Activation, NeuralNodesController,
} from "./mn-neural-nodes-types"
import { toInternal } from "./mn-neural-nodes-types"
import { applyForces, triggerPulse } from "./mn-neural-nodes-force"
import { drawFrame } from "./mn-neural-nodes-draw"

const neuralNodesWrap = cva("relative overflow-hidden", {
  variants: {
    size: {
      sm: "h-[280px]",
      md: "h-[400px]",
      lg: "h-[560px]",
      fluid: "h-full w-full",
    },
  },
  defaultVariants: { size: "md" },
})

type NeuralNodesSize = "sm" | "md" | "lg" | "fluid"
const DEFAULT_COLORS = ["var(--mn-accent, #FFC72C)", "var(--mn-info, #4EA8DE)", "var(--mn-success, #00A651)"]

export interface MnNeuralNodesProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof neuralNodesWrap> {
  nodes?: NeuralNodeData[]
  connections?: NeuralConnection[]
  nodeCount?: number
  connectionDensity?: number
  colors?: string[]
  pulseSpeed?: number
  particleCount?: number
  interactive?: boolean
  labels?: boolean
  forceLayout?: boolean
  labelFont?: string
  onReady?: (controller: NeuralNodesController) => void
}

function MnNeuralNodes({
  nodes: nodeData, connections: connData,
  nodeCount = 30, connectionDensity = 0.15,
  colors = DEFAULT_COLORS, pulseSpeed = 1, particleCount = 2,
  interactive = true, labels: showLabels, forceLayout: useForceLayout,
  labelFont = "monospace", size = "md", className, onReady, ...rest
}: MnNeuralNodesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const rafRef = React.useRef(0)
  const dataMode = Array.isArray(nodeData) && nodeData.length > 0
  const labelsOn = showLabels ?? dataMode
  const forceOn = useForceLayout ?? dataMode

  React.useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const s = {
      nodes: [] as InternalNode[], connections: [] as InternalConnection[],
      particles: [] as Particle[], waves: [] as Wave[],
      activations: [] as Activation[],
      activity: 0.55, hovered: -1, frame: 0, last: performance.now(),
    }

    function hiDpi(): void {
      const dpr = window.devicePixelRatio || 1
      const w = wrap!.clientWidth || 720, h = wrap!.clientHeight || 360
      canvas!.width = w * dpr; canvas!.height = h * dpr
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function spawn(): void {
      s.particles = s.connections.flatMap((_, idx) =>
        Array.from({ length: particleCount }, (_, lane) => ({
          connection: idx, lane, t: Math.random(),
          speed: 0.00012 + Math.random() * 0.00018,
        })),
      )
    }

    function buildExplicit(): void {
      if (!connData) { s.connections = []; spawn(); return }
      const idMap = new Map(s.nodes.map((n, i) => [n.id, i]))
      s.connections = []
      for (const c of connData) {
        const a = idMap.get(c.from), b = idMap.get(c.to)
        if (a !== undefined && b !== undefined)
          s.connections.push({ a, b, strength: c.strength ?? 0.5 })
      }
      spawn()
    }

    function rebuildAuto(): void {
      const cw = canvas!.clientWidth || 1, ch = canvas!.clientHeight || 1
      const thr = Math.min(cw, ch) * (0.14 + connectionDensity * 0.28)
      s.connections = []
      for (let i = 0; i < s.nodes.length; i++)
        for (let j = i + 1; j < s.nodes.length; j++)
          if (Math.hypot(s.nodes[i].x - s.nodes[j].x, s.nodes[i].y - s.nodes[j].y) < thr)
            s.connections.push({ a: i, b: j, strength: 0.5 })
      spawn()
    }

    function initNodes(): void {
      const w = canvas!.clientWidth || 1, h = canvas!.clientHeight || 1
      if (dataMode && nodeData) {
        s.nodes = nodeData.map((nd) => toInternal(nd, w, h, colors))
        buildExplicit()
      } else {
        s.nodes = Array.from({ length: nodeCount }, (_, i) => ({
          id: String(i),
          x: 24 + Math.random() * (w - 48), y: 24 + Math.random() * (h - 48),
          vx: (Math.random() - 0.5) * 0.025, vy: (Math.random() - 0.5) * 0.025,
          color: colors[i % colors.length], phase: Math.random() * Math.PI * 2,
          energy: Math.random() * 0.4, size: 1,
        }))
        rebuildAuto()
      }
    }

    function update(dt: number, now: number): void {
      const w = canvas!.clientWidth || 1, h = canvas!.clientHeight || 1
      while (s.activations[0] && s.activations[0].at <= now) {
        const cur = s.activations.shift()!
        const n = s.nodes[cur.index]
        if (n) { n.energy = 1.9; s.waves.push({ x: n.x, y: n.y, radius: 4, life: 1, color: n.color }) }
      }
      if (forceOn && dataMode) {
        applyForces(s.nodes, s.connections, w, h)
      } else {
        for (const n of s.nodes) {
          n.vx = (n.vx + (Math.random() - 0.5) * 0.0025 * dt) * 0.985
          n.vy = (n.vy + (Math.random() - 0.5) * 0.0025 * dt) * 0.985
          n.x += n.vx * dt; n.y += n.vy * dt
          if (n.x < 16 || n.x > w - 16) n.vx *= -1
          if (n.y < 16 || n.y > h - 16) n.vy *= -1
          n.x = Math.max(16, Math.min(w - 16, n.x))
          n.y = Math.max(16, Math.min(h - 16, n.y))
        }
        if (++s.frame % 14 === 0) rebuildAuto()
      }
      for (const n of s.nodes) n.energy = Math.max(0, n.energy - dt * 0.0016)
      for (const p of s.particles)
        p.t = (p.t + dt * p.speed * (0.45 + s.activity * 1.8) * pulseSpeed) % 1
      for (let i = s.waves.length - 1; i >= 0; i--) {
        s.waves[i].life -= dt * 0.0013 * pulseSpeed
        s.waves[i].radius += dt * 0.11 * pulseSpeed
        if (s.waves[i].life <= 0) s.waves.splice(i, 1)
      }
    }

    function loop(now: number): void {
      const dt = Math.min(48, now - s.last || 16); s.last = now
      update(dt, now)
      drawFrame(ctx!, now, {
        nodes: s.nodes, connections: s.connections, particles: s.particles,
        waves: s.waves, hovered: s.hovered, activity: s.activity,
        pulseSpeed, particleCount, labels: labelsOn, labelFont,
      })
      rafRef.current = requestAnimationFrame(loop)
    }

    function onMove(e: MouseEvent): void {
      const r = canvas!.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      s.hovered = s.nodes.findIndex((n) => Math.hypot(n.x - x, n.y - y) < 18 + n.energy * 8)
    }
    function onLeave(): void { s.hovered = -1 }

    hiDpi()
    initNodes()
    if (interactive) {
      canvas.addEventListener("mousemove", onMove)
      canvas.addEventListener("mouseleave", onLeave)
    }
    rafRef.current = requestAnimationFrame(loop)
    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => { hiDpi(); if (!s.nodes.length) initNodes() })
      : null
    ro?.observe(wrap)

    onReady?.({
      pulse: (t) => triggerPulse(t, s.nodes, s.connections, s.activations),
      setActivity: (lvl) => { s.activity = Math.max(0, Math.min(1, lvl)) },
      highlightNode: (id) => {
        s.hovered = id === null ? -1 : s.nodes.findIndex((n) => n.id === id)
      },
    })

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro?.disconnect()
      canvas.removeEventListener("mousemove", onMove)
      canvas.removeEventListener("mouseleave", onLeave)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeData, connData, nodeCount, connectionDensity, dataMode])

  return (
    <div
      ref={wrapRef}
      className={cn(neuralNodesWrap({ size: size as NeuralNodesSize }), className)}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        role="img"
        aria-label="Neural nodes visualization"
      />
    </div>
  )
}

export { MnNeuralNodes, neuralNodesWrap }
export type { NeuralNodeData, NeuralConnection, NeuralNodesController }
