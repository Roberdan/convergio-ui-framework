/**
 * Maranello Brain 3D – palette reader and color helpers.
 */
import { NODE_TYPE_TOKENS } from "./mn-brain-3d.types"
import type { Brain3DNode } from "./mn-brain-3d.types"

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

function rc(el: Element, token: string, fb: string): string {
  const v = getComputedStyle(el).getPropertyValue(token).trim()
  if (!v) return fb
  return v.startsWith("#") || v.startsWith("rgb") || v.startsWith("hsl")
    ? v
    : `hsl(${v})`
}

export function readBrain3DPalette(el: Element): Brain3DPalette {
  return {
    core: rc(el, NODE_TYPE_TOKENS.core[0], NODE_TYPE_TOKENS.core[1]),
    worker: rc(el, NODE_TYPE_TOKENS.worker[0], NODE_TYPE_TOKENS.worker[1]),
    coordinator: rc(el, NODE_TYPE_TOKENS.coordinator[0], NODE_TYPE_TOKENS.coordinator[1]),
    extension: rc(el, NODE_TYPE_TOKENS.extension[0], NODE_TYPE_TOKENS.extension[1]),
    text: rc(el, "--mn-text", "#fafafa"),
    accent: rc(el, "--mn-accent", "#FFC72C"),
    surface: rc(el, "--mn-surface", "#1a1a1a"),
    error: rc(el, "--destructive", "#ef4444"),
  }
}

export function nodeColor(node: Brain3DNode, pal: Brain3DPalette): string {
  if (node.status === "error") return pal.error
  return pal[node.type]
}

