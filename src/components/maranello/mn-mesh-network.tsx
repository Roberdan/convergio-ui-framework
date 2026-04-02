"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  type EdgeAnim,
  type NodePos,
  type Particle,
  circleLayout,
  drawFrame,
  maybeSpawnParticle,
  readPalette,
  setupCanvas,
} from "./mn-mesh-network.helpers"

/* ── CVA wrapper ───────────────────────────────────────────── */
const meshNetworkWrap = cva("relative overflow-hidden rounded-lg border bg-card", {
  variants: { size: { sm: "max-w-xs", md: "max-w-md", lg: "max-w-lg", fluid: "w-full" } },
  defaultVariants: { size: "fluid" },
})
type WrapSize = NonNullable<VariantProps<typeof meshNetworkWrap>["size"]>

/* ── Public types ──────────────────────────────────────────── */
export interface MeshNode {
  id: string
  label: string
  status: "online" | "offline" | "degraded"
  type: "coordinator" | "worker" | "kernel" | "relay"
}

export interface MeshEdge {
  from: string
  to: string
  latency?: number
}

export interface MnMeshNetworkProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof meshNetworkWrap> {
  nodes: MeshNode[]
  edges: MeshEdge[]
  onNodeSelect?: (node: MeshNode) => void
  ariaLabel?: string
  /** Maximum simultaneous data-flow particles. */
  maxParticles?: number
}

const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  degraded: "Degraded",
}

const TYPE_RADIUS: Record<string, number> = {
  coordinator: 18, worker: 13, kernel: 15, relay: 11,
}

/**
 * Canvas-based mesh network topology with animated data-flow
 * particles, node pulse/glow, and connection establishment.
 */
export function MnMeshNetwork({
  nodes,
  edges,
  onNodeSelect,
  ariaLabel = "Mesh network topology",
  maxParticles = 12,
  size = "fluid",
  className,
  ...rest
}: MnMeshNetworkProps) {
  const cvs = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const lastTs = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const edgeAnimsRef = useRef<EdgeAnim[]>([])
  const posRef = useRef(new Map<string, NodePos>())
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = useCallback(
    (node: MeshNode) => {
      setSelected(node.id)
      onNodeSelect?.(node)
    },
    [onNodeSelect],
  )

  // Build positions whenever nodes change
  useEffect(() => {
    if (!nodes?.length) return
    const dim = 400
    const pts = circleLayout(nodes.length, dim / 2, dim / 2, dim * 0.35)
    const map = new Map<string, NodePos>()
    nodes.forEach((n, i) => {
      map.set(n.id, { ...pts[i], pulsePhase: Math.random() * Math.PI * 2, established: 0 })
    })
    posRef.current = map
  }, [nodes])

  // Reset edge animations when edges change
  useEffect(() => {
    edgeAnimsRef.current = edges.map(() => ({ established: 0 }))
    particlesRef.current = []
  }, [edges])

  // Animation loop
  useEffect(() => {
    const canvas = cvs.current
    const host = wrap.current
    if (!canvas || !host || !nodes?.length) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const w = Math.max(280, host.clientWidth || 400)
      const h = Math.max(280, host.clientHeight || 400)
      setupCanvas(canvas, w, h)
    }

    const palette = readPalette(host)

    const loop = (now: number) => {
      const dt = Math.min(48, lastTs.current ? now - lastTs.current : 16)
      lastTs.current = now
      const w = canvas.clientWidth || 1
      const h = canvas.clientHeight || 1

      maybeSpawnParticle(particlesRef.current, edges, nodes, maxParticles)
      drawFrame(
        ctx, w, h, dt, now,
        nodes, edges, posRef.current,
        particlesRef.current, edgeAnimsRef.current,
        selected, palette,
      )
      raf.current = requestAnimationFrame(loop)
    }

    resize()
    raf.current = requestAnimationFrame(loop)
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null
    ro?.observe(host)
    return () => { cancelAnimationFrame(raf.current); ro?.disconnect() }
  }, [nodes, edges, selected, maxParticles])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!cvs.current || !nodes?.length) return
      const rect = cvs.current.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      for (const node of nodes) {
        const pos = posRef.current.get(node.id)
        if (!pos) continue
        const r = TYPE_RADIUS[node.type] ?? 13
        if (Math.hypot(mx - pos.x, my - pos.y) <= r + 4) {
          handleSelect(node)
          return
        }
      }
    },
    [nodes, handleSelect],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && nodes?.length) {
        e.preventDefault()
        const idx = selected ? nodes.findIndex((n) => n.id === selected) : -1
        const next = nodes[(idx + 1) % nodes.length]
        if (next) handleSelect(next)
      }
    },
    [nodes, selected, handleSelect],
  )

  if (!nodes?.length) {
    return (
      <div className={cn("rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground", className)}>
        No mesh nodes to display.
      </div>
    )
  }

  return (
    <div
      ref={wrap}
      role="img"
      aria-label={ariaLabel}
      className={cn(meshNetworkWrap({ size: size as WrapSize }), "p-4", className)}
      {...rest}
    >
      <canvas
        ref={cvs}
        className="block w-full aspect-square"
        onClick={handleCanvasClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-hidden="true"
      />

      {/* Screen-reader accessible list */}
      <ul className="sr-only" aria-label="Mesh nodes">
        {nodes.map((n) => (
          <li key={n.id}>
            {n.label}: {STATUS_LABELS[n.status] ?? n.status} ({n.type})
          </li>
        ))}
      </ul>
    </div>
  )
}

export { meshNetworkWrap }
