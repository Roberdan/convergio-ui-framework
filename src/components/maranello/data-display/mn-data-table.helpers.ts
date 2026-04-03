import type { ReactNode } from "react"
import { cva } from "class-variance-authority"

/* ── V2 Cell Renderer Types ──────────────────────────────── */

export interface StatusBadgeMeta { cls: string; symbol: string }
export const STATUS_MAP: Record<string, StatusBadgeMeta> = {
  active: { cls: "bg-[var(--mn-success-bg,rgba(34,197,94,.15))] text-[var(--mn-success,#22c55e)]", symbol: "\u25CF" },
  completed: { cls: "bg-[var(--mn-success-bg,rgba(34,197,94,.15))] text-[var(--mn-success,#22c55e)]", symbol: "\u2713" },
  "at risk": { cls: "bg-[var(--mn-warning-bg,rgba(245,158,11,.15))] text-[var(--mn-warning,#f59e0b)]", symbol: "\u25B2" },
  warning: { cls: "bg-[var(--mn-warning-bg,rgba(245,158,11,.15))] text-[var(--mn-warning,#f59e0b)]", symbol: "\u25B2" },
  blocked: { cls: "bg-[var(--mn-error-bg,rgba(239,68,68,.15))] text-[var(--mn-error,#ef4444)]", symbol: "\u25CF" },
  "on hold": { cls: "bg-[var(--mn-error-bg,rgba(239,68,68,.15))] text-[var(--mn-error,#ef4444)]", symbol: "\u25A0" },
  planned: { cls: "bg-[var(--mn-info-bg,rgba(59,130,246,.15))] text-[var(--mn-info,#3b82f6)]", symbol: "\u25CB" },
  info: { cls: "bg-[var(--mn-info-bg,rgba(59,130,246,.15))] text-[var(--mn-info,#3b82f6)]", symbol: "\u25CF" },
}
export interface MetricValue { value: number; trend: "up" | "down" | "flat"; delta?: string }
export interface PersonValue { name: string; avatar?: string; email?: string }
export interface ProgressValue { value: number; max?: number; label?: string }
export interface ActionDef { label: string; id: string }
export interface ActionValue { actions: ActionDef[] }
export interface LinkValue { text: string; href: string; external?: boolean }

export function toInitials(name: string): string { return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() }
export function clampPct(v: number, max: number): number { return Math.max(0, Math.min(100, (v / Math.max(1, max)) * 100)) }

/* ── Types ───────────────────────────────────────────────── */

export type CellType = "status" | "progress" | "sparkline" | "avatar" | "action" | "link"

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string; label?: string; sortable?: boolean; filterable?: boolean
  align?: "left" | "center" | "right"; width?: string | number
  render?: (value: unknown, row: T) => ReactNode
  type?: CellType
}

export type SortDir = "asc" | "desc"
export type SelectionMode = "single" | "multi"

/* ── Helpers ──────────────────────────────────────────────── */

export function compare(a: unknown, b: unknown, dir: number): number {
  if (a == null && b == null) return 0
  if (a == null) return dir; if (b == null) return -dir
  if (typeof a === "number" && typeof b === "number") return (a - b) * dir
  return String(a).localeCompare(String(b)) * dir
}

export function processRows<T extends Record<string, unknown>>(rows: T[], filters: Record<string, string>, sortKey: string | null, sortDir: number): T[] {
  const keys = Object.keys(filters)
  let out = keys.length > 0
    ? rows.filter((r) => keys.every((k) => !filters[k] || String(r[k] ?? "").toLowerCase().includes(filters[k].toLowerCase())))
    : rows
  if (sortKey) out = [...out].sort((a, b) => compare(a[sortKey], b[sortKey], sortDir))
  return out
}

export function groupRows<T extends Record<string, unknown>>(rows: T[], key: string): { name: string; rows: T[] }[] {
  const map = new Map<string, T[]>()
  for (const r of rows) { const k = String(r[key] ?? "Other"); if (!map.has(k)) map.set(k, []); map.get(k)!.push(r) }
  return Array.from(map, ([name, rows]) => ({ name, rows }))
}

export const tableWrap = cva("w-full overflow-auto rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)]", {
  variants: { compact: { true: "[&_td]:py-1 [&_th]:py-1", false: "" } },
  defaultVariants: { compact: false },
})

export const thBase = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--mn-text-muted)]"
export const tdBase = "px-3 py-2 text-sm text-[var(--mn-text)]"
export const rowBase = "border-b border-[var(--mn-border)] transition-colors hover:bg-[var(--mn-surface-raised)]"
export const alignCls = (a?: string) => a === "right" ? "text-right" : a === "center" ? "text-center" : undefined
export const widthStyle = (w?: string | number) => w ? { width: typeof w === "number" ? `${w}px` : w } : undefined
