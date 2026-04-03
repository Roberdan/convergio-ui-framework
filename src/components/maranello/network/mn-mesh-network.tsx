"use client"

import { useCallback, useMemo, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { MnMeshNetworkToolbar, type MeshAction } from "./mn-mesh-network-toolbar"
import { MnMeshNetworkCard } from "./mn-mesh-network-card"
import { MnMeshNetworkCanvas } from "./mn-mesh-network-canvas"

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
  location?: "local" | "remote"
  agents?: string[]
  cpu?: number
  ram?: number
  activeTasks?: number
  delegatedTasks?: number
  syncPercent?: number
  driftPercent?: number
  latencyMs?: number
  coldStandby?: boolean
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
  onAction?: (action: MeshAction) => void
  onNodeAction?: (node: MeshNode, action: string) => void
  ariaLabel?: string
  /** Maximum simultaneous data-flow particles (canvas mode). */
  maxParticles?: number
}

/** Nodes with extended fields render as HTML cards instead of canvas. */
function hasExtendedData(nodes: MeshNode[]): boolean {
  return nodes.some((n) => n.cpu != null || n.ram != null || (n.agents && n.agents.length > 0))
}

const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  degraded: "Degraded",
}

/**
 * Mesh network topology — renders as HTML card grid when nodes
 * have extended data (cpu/ram/agents), falls back to canvas animation.
 */
export function MnMeshNetwork({
  nodes,
  edges,
  onNodeSelect,
  onAction,
  onNodeAction,
  ariaLabel = "Mesh network topology",
  maxParticles = 12,
  size = "fluid",
  className,
  ...rest
}: MnMeshNetworkProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = useCallback(
    (node: MeshNode) => {
      setSelected(node.id)
      onNodeSelect?.(node)
    },
    [onNodeSelect],
  )

  const useCards = useMemo(() => hasExtendedData(nodes ?? []), [nodes])
  const onlineCount = useMemo(() => (nodes ?? []).filter((n) => n.status === "online").length, [nodes])

  if (!nodes?.length) {
    return (
      <div className={cn("rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground", className)}>
        No mesh nodes to display.
      </div>
    )
  }

  if (useCards) {
    return (
      <div
        role="region"
        aria-label={ariaLabel}
        className={cn(meshNetworkWrap({ size: size as WrapSize }), className)}
        {...rest}
      >
        <MnMeshNetworkToolbar
          onlineCount={onlineCount}
          totalCount={nodes.length}
          onAction={onAction}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
          {nodes.map((node) => (
            <MnMeshNetworkCard
              key={node.id}
              node={node}
              selected={selected === node.id}
              onSelect={handleSelect}
              onAction={onNodeAction}
            />
          ))}
        </div>
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

  return (
    <MnMeshNetworkCanvas
      nodes={nodes}
      edges={edges}
      selected={selected}
      onNodeClick={handleSelect}
      ariaLabel={ariaLabel}
      maxParticles={maxParticles}
      size={size}
      className={className}
      {...rest}
    />
  )
}

export { meshNetworkWrap }
