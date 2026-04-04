"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { Brain3DNode, Brain3DEdge } from "./mn-brain-3d.types"
import {
  readBrain3DPalette, nodeColor, nodeRadius,
  edgeWidth, edgeParticles, edgeParticleSpeed, type Brain3DPalette,
} from "./mn-brain-3d.helpers"

/* ── CVA ───────────────────────────────────────────────────── */
const brain3dWrap = cva("relative block overflow-hidden rounded-lg", {
  variants: {
    size: { sm: "max-w-xs", md: "max-w-md", lg: "max-w-xl", fluid: "w-full" },
  },
  defaultVariants: { size: "md" },
})

/* ── Props ─────────────────────────────────────────────────── */
export interface MnBrain3DProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof brain3dWrap> {
  nodes: Brain3DNode[]
  edges: Brain3DEdge[]
  onNodeClick?: (node: Brain3DNode) => void
  onNodeHover?: (node: Brain3DNode | null) => void
  autoRotate?: boolean
  autoRotateSpeed?: number
  showLabels?: boolean
  height?: number
  backgroundColor?: string
  ariaLabel?: string
}

/* ── Lazy load (WebGL / SSR safety) ─────────────────────── */
const ForceGraph3D = React.lazy(() => import("react-force-graph-3d"))

/* ── Auto-rotate hook ──────────────────────────────────────── */
function useAutoRotate(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  fgRef: React.MutableRefObject<any>,
  enabled: boolean,
  speed: number,
  reducedMotion: boolean,
) {
  const idle = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const rotating = React.useRef(enabled && !reducedMotion)

  React.useEffect(() => {
    rotating.current = enabled && !reducedMotion
  }, [enabled, reducedMotion])

  const onInteract = React.useCallback(() => {
    rotating.current = false
    if (idle.current) clearTimeout(idle.current)
    idle.current = setTimeout(() => {
      if (enabled && !reducedMotion) rotating.current = true
    }, 3000)
  }, [enabled, reducedMotion])

  React.useEffect(() => {
    let raf = 0
    const spin = () => {
      const fg = fgRef.current as Record<string, unknown> | null
      if (fg && rotating.current) {
        const ctrl = fg.controls as { autoRotate?: boolean; autoRotateSpeed?: number } | undefined
        if (ctrl) {
          ctrl.autoRotate = true
          ctrl.autoRotateSpeed = speed
        }
      } else if (fg) {
        const ctrl = fg.controls as { autoRotate?: boolean } | undefined
        if (ctrl) ctrl.autoRotate = false
      }
      raf = requestAnimationFrame(spin)
    }
    raf = requestAnimationFrame(spin)
    return () => {
      cancelAnimationFrame(raf)
      if (idle.current) clearTimeout(idle.current)
    }
  }, [fgRef, speed])

  return onInteract
}

/* ── Component ─────────────────────────────────────────────── */
export function MnBrain3D({
  nodes,
  edges,
  onNodeClick,
  onNodeHover,
  autoRotate = true,
  autoRotateSpeed = 0.5,
  showLabels = true,
  height = 500,
  backgroundColor = "rgba(0,0,0,0)",
  ariaLabel = "3D agent network visualization",
  size = "md",
  className,
  ...rest
}: MnBrain3DProps) {
  const wrap = React.useRef<HTMLDivElement>(null)
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const fgRef = React.useRef<any>(null)
  const [palette, setPalette] = React.useState<Brain3DPalette | null>(null)
  const [containerWidth, setContainerWidth] = React.useState(400)
  const reducedMotion = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  React.useEffect(() => {
    const el = wrap.current
    if (!el) return
    setContainerWidth(el.clientWidth || 400)
    setPalette(readBrain3DPalette(el))
    const obs = new MutationObserver(() => setPalette(readBrain3DPalette(el)))
    const html = el.ownerDocument.documentElement
    obs.observe(html, { attributes: true, attributeFilter: ["data-theme"] })
    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => setContainerWidth(el.clientWidth || 400))
      : null
    ro?.observe(el)
    return () => { obs.disconnect(); ro?.disconnect() }
  }, [])

  const onInteract = useAutoRotate(fgRef, autoRotate, autoRotateSpeed, reducedMotion)

  const graphData = React.useMemo(() => ({
    nodes: nodes.map((n) => ({ ...n, _brain: n })),
    links: edges.map((e) => ({
      source: e.source,
      target: e.target,
      _edge: e,
    })),
  }), [nodes, edges])

  const handleNodeClick = React.useCallback(
    (node: Record<string, unknown>) => {
      const brain = node._brain as Brain3DNode | undefined
      if (brain && onNodeClick) onNodeClick(brain)
    },
    [onNodeClick],
  )

  const handleNodeHover = React.useCallback(
    (node: Record<string, unknown> | null) => {
      if (!onNodeHover) return
      const brain = node?._brain as Brain3DNode | undefined
      onNodeHover(brain ?? null)
    },
    [onNodeHover],
  )

  const ariaDesc = React.useMemo(
    () => `${ariaLabel}: ${nodes.length} nodes, ${edges.length} edges`,
    [ariaLabel, nodes.length, edges.length],
  )

  if (!palette) {
    return (
      <div ref={wrap} className={cn(brain3dWrap({ size }), className)} {...rest}
        style={{ height }} role="img" aria-label={ariaDesc} />
    )
  }

  return (
    <div
      ref={wrap}
      className={cn(brain3dWrap({ size }), className)}
      role="img"
      aria-label={ariaDesc}
      onMouseDown={onInteract}
      onTouchStart={onInteract}
      onWheel={onInteract}
      {...rest}
    >
      <React.Suspense fallback={
        <div style={{ height }} className="flex items-center justify-center text-muted-foreground text-sm">
          Loading 3D...
        </div>
      }>
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          width={containerWidth}
          height={height}
          backgroundColor={backgroundColor}
          nodeLabel={showLabels ? (n: Record<string, unknown>) => {
            const b = n._brain as Brain3DNode
            return `${b.label}${b.model ? ` (${b.model})` : ""}`
          } : undefined}
          nodeColor={(n: Record<string, unknown>) => {
            const b = n._brain as Brain3DNode
            return nodeColor(b, palette)
          }}
          nodeVal={(n: Record<string, unknown>) => {
            const b = n._brain as Brain3DNode
            return nodeRadius(b)
          }}
          linkWidth={(l: Record<string, unknown>) => {
            const e = l._edge as Brain3DEdge
            return edgeWidth(e)
          }}
          linkDirectionalParticles={reducedMotion ? 0 : (l: Record<string, unknown>) => {
            const e = l._edge as Brain3DEdge
            return edgeParticles(e)
          }}
          linkDirectionalParticleSpeed={reducedMotion ? 0 : (l: Record<string, unknown>) => {
            const e = l._edge as Brain3DEdge
            return edgeParticleSpeed(e)
          }}
          linkDirectionalParticleWidth={2}
          linkColor={() => palette.text}
          linkOpacity={0.3}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          enableNodeDrag={!reducedMotion}
        />
      </React.Suspense>
    </div>
  )
}

export { brain3dWrap }
