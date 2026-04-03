"use client"

import { useCallback, useEffect, useRef } from "react"
import { type VariantProps } from "class-variance-authority"

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
import type { MeshNode, MeshEdge } from "./mn-mesh-network"

/* ── Reuse the wrapper from parent ─────────────────────────── */
import { meshNetworkWrap } from "./mn-mesh-network"
type WrapSize = NonNullable<VariantProps<typeof meshNetworkWrap>["size"]>

const STATUS_LABELS: Record<string, string> = {
  online: "Online", offline: "Offline", degraded: "Degraded",
}

const TYPE_RADIUS: Record<string, number> = {
  coordinator: 18, worker: 13, kernel: 15, relay: 11,
}

export interface MnMeshNetworkCanvasProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof meshNetworkWrap> {
  nodes: MeshNode[]
  edges: MeshEdge[]
  selected: string | null
  onNodeClick: (node: MeshNode) => void
  ariaLabel: string
  maxParticles: number
}

export function MnMeshNetworkCanvas({
  nodes, edges, selected, onNodeClick, ariaLabel, maxParticles,
  size = "fluid", className, ...rest
}: MnMeshNetworkCanvasProps) {
  const cvs = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const lastTs = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const edgeAnimsRef = useRef<EdgeAnim[]>([])
  const posRef = useRef(new Map<string, NodePos>())

  const buildPositions = useCallback((w: number, h: number) => {
    if (!nodes?.length) return
    const dim = Math.min(w, h)
    const pts = circleLayout(nodes.length, w / 2, h / 2, dim * 0.35)
    const map = new Map<string, NodePos>()
    nodes.forEach((n, i) => {
      map.set(n.id, { ...pts[i], pulsePhase: Math.random() * Math.PI * 2, established: 0 })
    })
    posRef.current = map
  }, [nodes])

  useEffect(() => {
    edgeAnimsRef.current = edges.map(() => ({ established: 0 }))
    particlesRef.current = []
  }, [edges])

  useEffect(() => {
    const canvas = cvs.current
    const host = wrap.current
    if (!canvas || !host || !nodes?.length) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const w = Math.max(200, canvas.clientWidth || host.clientWidth || 400)
      const h = Math.max(200, canvas.clientHeight || host.clientHeight || 400)
      setupCanvas(canvas, w, h)
      buildPositions(w, h)
    }

    const palette = readPalette(host)
    resize()

    const loop = (now: number) => {
      const dt = Math.min(48, lastTs.current ? now - lastTs.current : 16)
      lastTs.current = now
      const w = canvas.clientWidth || 1
      const h = canvas.clientHeight || 1
      if (posRef.current.size === 0 && nodes.length > 0) buildPositions(w, h)
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
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null
    ro?.observe(canvas)
    return () => { cancelAnimationFrame(raf.current); ro?.disconnect() }
  }, [nodes, edges, selected, maxParticles, buildPositions])

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
          onNodeClick(node)
          return
        }
      }
    },
    [nodes, onNodeClick],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && nodes?.length) {
        e.preventDefault()
        const idx = selected ? nodes.findIndex((n) => n.id === selected) : -1
        const next = nodes[(idx + 1) % nodes.length]
        if (next) onNodeClick(next)
      }
    },
    [nodes, selected, onNodeClick],
  )

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
