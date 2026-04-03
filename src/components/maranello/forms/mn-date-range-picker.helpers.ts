import { cva } from "class-variance-authority"

/* ── Variants ── */

export const dayVariants = cva(
  "inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] cursor-pointer transition-colors text-[var(--mn-text)] hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
  {
    variants: {
      today: { true: "font-bold ring-1 ring-[var(--mn-accent)]", false: "" },
      selected: { true: "bg-[var(--mn-accent)] text-[var(--mn-text-inverse)] hover:bg-[var(--mn-accent)]", false: "" },
      inRange: { true: "bg-[var(--mn-accent)]/15", false: "" },
      disabled: { true: "pointer-events-none opacity-40 text-[var(--mn-text-muted)]", false: "" },
    },
    defaultVariants: { today: false, selected: false, inRange: false, disabled: false },
  },
)

/* ── Helpers ── */

export const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
export const startDow = (y: number, m: number) => new Date(y, m, 1).getDay()
export const toIso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
export const parseIso = (v: string) => { const [y, m, d] = v.split("-").map(Number); return { y, m: m - 1, d } }
export const WDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const
export const navCls = "rounded-[var(--radius-md)] p-1.5 text-[var(--mn-text-muted)] hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]"

export type PresetKey = "7d" | "30d" | "month" | "custom"
export interface Preset { key: PresetKey; label: string }

export const PRESETS: Preset[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
  { key: "custom", label: "Custom" },
]

export function presetRange(key: PresetKey): { from: string; to: string } | null {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
  switch (key) {
    case "7d": { const s = new Date(y, m, d - 6); return { from: toIso(s.getFullYear(), s.getMonth(), s.getDate()), to: toIso(y, m, d) } }
    case "30d": { const s = new Date(y, m, d - 29); return { from: toIso(s.getFullYear(), s.getMonth(), s.getDate()), to: toIso(y, m, d) } }
    case "month": return { from: toIso(y, m, 1), to: toIso(y, m, daysIn(y, m)) }
    case "custom": return null
  }
}

const SHORT_M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatDisplay(iso: string): string {
  const { y, m, d } = parseIso(iso)
  return `${d} ${SHORT_M[m]} ${y}`
}

/* ── Types ── */

export interface DateRange { from: string | null; to: string | null }

export interface CalendarProps {
  year: number; month: number; today: { y: number; m: number; d: number }
  rangeFrom: string | null; rangeTo: string | null; hoverDate: string | null
  onSelect: (iso: string) => void; onHover: (iso: string | null) => void
  min?: string; max?: string
}
