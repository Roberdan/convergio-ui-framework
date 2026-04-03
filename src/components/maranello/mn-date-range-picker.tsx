"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { formatMonthYear } from "./mn-format"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

/* ── Variants ── */

const pickerVariants = cva("relative inline-block font-[var(--font-body)]", {
  variants: { size: { sm: "text-sm", default: "text-sm", lg: "text-base" } },
  defaultVariants: { size: "default" },
})

const dayVariants = cva(
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

const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
const startDow = (y: number, m: number) => new Date(y, m, 1).getDay()
const toIso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
const parseIso = (v: string) => { const [y, m, d] = v.split("-").map(Number); return { y, m: m - 1, d } }
const WDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const
const navCls = "rounded-[var(--radius-md)] p-1.5 text-[var(--mn-text-muted)] hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]"

type PresetKey = "7d" | "30d" | "month" | "custom"
interface Preset { key: PresetKey; label: string }

const PRESETS: Preset[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
  { key: "custom", label: "Custom" },
]

function presetRange(key: PresetKey): { from: string; to: string } | null {
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
function formatDisplay(iso: string): string {
  const { y, m, d } = parseIso(iso)
  return `${d} ${SHORT_M[m]} ${y}`
}

/* ── Types ── */

export interface DateRange { from: string | null; to: string | null }

export interface MnDateRangePickerProps extends VariantProps<typeof pickerVariants> {
  value?: DateRange
  onChange?: (range: DateRange) => void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

/* ── Calendar grid ── */

interface CalendarProps { year: number; month: number; today: { y: number; m: number; d: number }; rangeFrom: string | null; rangeTo: string | null; hoverDate: string | null; onSelect: (iso: string) => void; onHover: (iso: string | null) => void; min?: string; max?: string }

function CalendarMonth({ year, month, today, rangeFrom, rangeTo, hoverDate, onSelect, onHover, min, max }: CalendarProps) {
  const total = daysIn(year, month)
  const offset = startDow(year, month)
  const label = formatMonthYear(year, month)
  const effectiveTo = rangeTo ?? hoverDate

  return (
    <div>
      <div className="mb-1 text-center text-sm font-semibold text-[var(--mn-text)] font-[var(--font-display)]">{label}</div>
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-[var(--mn-text-muted)]">
        {WDAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
      </div>
      <div role="grid" aria-label={label} className="grid grid-cols-7 gap-px">
        {Array.from({ length: offset }, (_, i) => <span key={`e-${i}`} />)}
        {Array.from({ length: total }, (_, i) => {
          const d = i + 1
          const iso = toIso(year, month, d)
          const isToday = d === today.d && month === today.m && year === today.y
          const isSel = iso === rangeFrom || iso === rangeTo
          const isInRange = !!(rangeFrom && effectiveTo && iso > rangeFrom && iso < effectiveTo)
          const isDis = (!!min && iso < min) || (!!max && iso > max)
          return (
            <button
              key={d} type="button" role="gridcell"
              aria-selected={isSel || undefined} aria-disabled={isDis || undefined}
              className={dayVariants({ today: isToday, selected: isSel, inRange: isInRange, disabled: isDis })}
              onClick={() => !isDis && onSelect(iso)}
              onMouseEnter={() => onHover(iso)}
              onMouseLeave={() => onHover(null)}
            >{d}</button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Component ── */

function MnDateRangePicker({ value, onChange, min, max, placeholder = "Select date range", disabled, size, className }: MnDateRangePickerProps) {
  const today = React.useMemo(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() } }, [])
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<DateRange>({ from: value?.from ?? null, to: value?.to ?? null })
  const [picking, setPicking] = React.useState(false)
  const [hoverDate, setHoverDate] = React.useState<string | null>(null)
  const [leftY, setLeftY] = React.useState(today.y)
  const [leftM, setLeftM] = React.useState(today.m === 0 ? 11 : today.m - 1)
  const rightY = leftM === 11 ? leftY + 1 : leftY
  const rightM = leftM === 11 ? 0 : leftM + 1
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (value?.from) { const p = parseIso(value.from); setLeftY(p.y); setLeftM(p.m) }
    setDraft({ from: value?.from ?? null, to: value?.to ?? null })
  }, [value?.from, value?.to])

  const handleSelect = (iso: string) => {
    if (!picking || !draft.from) {
      setDraft({ from: iso, to: null }); setPicking(true); return
    }
    if (iso < draft.from) { setDraft({ from: iso, to: null }); return }
    setDraft({ from: draft.from, to: iso }); setPicking(false)
  }

  const handlePreset = (key: PresetKey) => {
    const r = presetRange(key)
    if (r) { setDraft(r); setPicking(false); if (r.from) { const p = parseIso(r.from); setLeftY(p.y); setLeftM(p.m) } }
    else setPicking(true)
  }

  const handleApply = () => { onChange?.(draft); setOpen(false) }
  const handleCancel = () => { setDraft({ from: value?.from ?? null, to: value?.to ?? null }); setPicking(false); setOpen(false) }

  const navLeft = (delta: number) => {
    let m = leftM + delta, y = leftY
    if (m > 11) { m = 0; y++ } else if (m < 0) { m = 11; y-- }
    setLeftY(y); setLeftM(m)
  }

  React.useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) handleCancel() }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  })

  React.useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleCancel() }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  })

  const displayLabel = value?.from && value.to
    ? `${formatDisplay(value.from)} – ${formatDisplay(value.to)}`
    : value?.from ? `${formatDisplay(value.from)} – …` : placeholder

  return (
    <div ref={containerRef} data-slot="mn-date-range-picker" className={cn(pickerVariants({ size }), className)}>
      <button
        type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--mn-border)]",
          "bg-[var(--mn-surface-raised)] px-3 py-2 text-left text-[var(--mn-text)]",
          "transition-colors hover:border-[var(--mn-accent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Calendar className="size-4 shrink-0 text-[var(--mn-text-muted)]" aria-hidden="true" />
        <span className={cn(!value?.from && "text-[var(--mn-text-muted)]")}>{displayLabel}</span>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Date range picker" className={cn(
          "absolute z-50 mt-1 rounded-[var(--radius-md)] border border-[var(--mn-border)]",
          "bg-[var(--mn-surface-raised)] p-4 shadow-[var(--shadow-deep)]",
        )}>
          {/* Presets */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.key} type="button" onClick={() => handlePreset(p.key)}
                className="rounded-[var(--radius-md)] border border-[var(--mn-border)] px-2.5 py-1 text-xs font-medium text-[var(--mn-text)] transition-colors hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]">
                {p.label}
              </button>
            ))}
          </div>
          {/* Calendars */}
          <div className="flex gap-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <button type="button" aria-label="Previous month" onClick={() => navLeft(-1)} className={navCls}>
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
              </div>
              <CalendarMonth year={leftY} month={leftM} today={today} rangeFrom={draft.from} rangeTo={draft.to} hoverDate={picking ? hoverDate : null} onSelect={handleSelect} onHover={setHoverDate} min={min} max={max} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-end">
                <button type="button" aria-label="Next month" onClick={() => navLeft(1)} className={navCls}>
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
              <CalendarMonth year={rightY} month={rightM} today={today} rangeFrom={draft.from} rangeTo={draft.to} hoverDate={picking ? hoverDate : null} onSelect={handleSelect} onHover={setHoverDate} min={min} max={max} />
            </div>
          </div>
          {/* Actions */}
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-[var(--mn-border)] pt-3">
            <button type="button" onClick={handleCancel}
              className="rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--mn-text-muted)] transition-colors hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]">
              Cancel
            </button>
            <button type="button" onClick={handleApply} disabled={!draft.from || !draft.to}
              className={cn(
                "rounded-[var(--radius-md)] bg-[var(--mn-accent)] px-3 py-1.5 text-sm font-medium text-[var(--mn-text-inverse)]",
                "transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
              )}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { MnDateRangePicker, pickerVariants, dayVariants }
