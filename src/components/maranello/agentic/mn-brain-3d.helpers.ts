/**
 * Maranello Brain 3D – helper utilities for Three.js node rendering.
 */
import type { Brain3DNode, Brain3DEdge } from "./mn-brain-3d.types"
import { NODE_TYPE_TOKENS, STATUS_OPACITY } from "./mn-brain-3d.types"

export interface Brain3DPalette {
  core: string
  worker: string
  coordinator: string
  extension: string
  text: string
  accent: string
  surface: string
  error: string
}

export function readBrain3DPalette(el: Element): Brain3DPalette {
  const rc = (token: string, fb: string): string => {
    const v = getComputedStyle(el).getPropertyValue(token).trim()
    if (!v) return fb
    return v.startsWith("#") || v.startsWith("rgb") || v.startsWith("hsl")
      ? v
      : `hsl(${v})`
  }

  return {
    core: rc(NODE_TYPE_TOKENS.core[0], NODE_TYPE_TOKENS.core[1]),
    worker: rc(NODE_TYPE_TOKENS.worker[0], NODE_TYPE_TOKENS.worker[1]),
    coordinator: rc(NODE_TYPE_TOKENS.coordinator[0], NODE_TYPE_TOKENS.coordinator[1]),
    extension: rc(NODE_TYPE_TOKENS.extension[0], NODE_TYPE_TOKENS.extension[1]),
    text: rc("--mn-text", "#fafafa"),
    accent: rc("--mn-accent", "#FFC72C"),
    surface: rc("--mn-surface", "#1a1a1a"),
    error: rc("--destructive", "#ef4444"),
  }
}

export function nodeColor(node: Brain3DNode, palette: Brain3DPalette): string {
  if (node.status === "error") return palette.error
  return palette[node.type]
}

export function nodeOpacity(node: Brain3DNode): number {
  return STATUS_OPACITY[node.status]
}

export function nodeRadius(node: Brain3DNode): number {
  const base = 4
  const tasks = node.activeTasks ?? 0
  return base + Math.min(tasks, 20) * 0.5
}

export function edgeWidth(edge: Brain3DEdge): number {
  return 1 + (edge.strength ?? 0.5) * 3
}

export function edgeParticles(edge: Brain3DEdge): number {
  return edge.active ? 4 : 0
}

export function edgeParticleSpeed(edge: Brain3DEdge): number {
  return 0.005 + (edge.strength ?? 0.5) * 0.01
}
