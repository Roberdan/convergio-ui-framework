"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { Brain3DNode, Brain3DEdge } from "./mn-brain-3d.types"
import { readBrain3DPalette } from "./mn-brain-3d.helpers"
import type { BrainSceneHandle } from "./mn-brain-3d.scene"

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
  ariaLabel?: string
}

/* ── Component ─────────────────────────────────────────────── */
export function MnBrain3D({
  nodes, edges, onNodeClick, onNodeHover,
  autoRotate = true, autoRotateSpeed = 0.5, showLabels = true,
  height = 500, ariaLabel = "3D agent network visualization",
  size = "md", className, ...rest
}: MnBrain3DProps) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const cvs = React.useRef<HTMLCanvasElement>(null)
  const handle = React.useRef<BrainSceneHandle | null>(null)
  const reducedMotion = React.useMemo(
    () => typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [],
  )

  React.useEffect(() => {
    const canvas = cvs.current, host = wrap.current
    if (!canvas || !host) return
    const w = host.clientWidth || 400
    const palette = readBrain3DPalette(host)

    import("./mn-brain-3d.scene").then(({ createBrainScene }) => {
      handle.current = createBrainScene({
        canvas, nodes, edges, palette,
        width: w, height, showLabels, reducedMotion,
        onNodeClick, onNodeHover,
      })
    })

    const themeObs = new MutationObserver(() => {
      handle.current?.dispose()
      import("./mn-brain-3d.scene").then(({ createBrainScene }) => {
        handle.current = createBrainScene({
          canvas, nodes, edges,
          palette: readBrain3DPalette(host),
          width: host.clientWidth || 400, height, showLabels, reducedMotion,
          onNodeClick, onNodeHover,
        })
      })
    })
    themeObs.observe(host.ownerDocument.documentElement,
      { attributes: true, attributeFilter: ["data-theme"] })

    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => handle.current?.resize(host.clientWidth || 400, height))
      : null
    ro?.observe(host)

    return () => { handle.current?.dispose(); themeObs.disconnect(); ro?.disconnect() }
  }, [nodes, edges, height, showLabels, reducedMotion, onNodeClick, onNodeHover])

  React.useEffect(() => {
    handle.current?.setAutoRotate(autoRotate, autoRotateSpeed)
  }, [autoRotate, autoRotateSpeed])

  const ariaDesc = `${ariaLabel}: ${nodes.length} nodes, ${edges.length} edges`

  return (
    <div ref={wrap} className={cn(brain3dWrap({ size }), className)}
      role="img" aria-label={ariaDesc} {...rest}>
      <canvas ref={cvs} className="block w-full" style={{ height }} tabIndex={0} />
    </div>
  )
}

export { brain3dWrap }
