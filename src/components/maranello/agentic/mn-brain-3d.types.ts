/**
 * Maranello Brain 3D – shared type definitions.
 */

export interface Brain3DNode {
  id: string
  label: string
  type: "core" | "worker" | "coordinator" | "extension"
  status: "active" | "idle" | "error" | "offline"
  model?: string
  activeTasks?: number
  group?: string
}

export interface Brain3DEdge {
  source: string
  target: string
  type: "delegation" | "sync" | "data" | "control"
  strength?: number
  active?: boolean
}

export const NODE_TYPE_TOKENS: Record<Brain3DNode["type"], [string, string]> = {
  core: ["--primary", "#6366f1"],
  worker: ["--chart-2", "#22c55e"],
  coordinator: ["--chart-3", "#f59e0b"],
  extension: ["--chart-4", "#8b5cf6"],
}

export const STATUS_OPACITY: Record<Brain3DNode["status"], number> = {
  active: 1.0,
  idle: 0.5,
  error: 0.8,
  offline: 0.25,
}

export const EDGE_DASH: Record<Brain3DEdge["type"], number[]> = {
  delegation: [],
  sync: [4, 2],
  data: [8, 4],
  control: [2, 2],
}
