"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Variants ── */

const datePickerVariants = cva("relative inline-block font-[var(--font-body)]", {
  variants: { size: { sm: "text-sm", default: "text-sm", lg: "text-base" } },
  defaultVariants: { size: "default" },
})

const dayVariants = cva(
  "inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] cursor-pointer transition-colors text-[var(--mn-text)] hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
  {
    variants: {
      today: { true: "font-bold ring-1 ring-[var(--mn-accent)]", false: "" },
      selected: { true: "bg-[var(--mn-accent)] text-[var(--mn-text-inverse)] hover:bg-[var(--mn-accent)]", false: "" },
      disabled: { true: "pointer-events-none opacity-40 text-[var(--mn-text-muted)]", false: "" },
    },
    defaultVariants: { today: false, selected: false, disabled: false },
  },
)

/* ── Helpers ── */

const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
const startDow = (y: number, m: number) => new Date(y, m, 1).getDay()
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
const parseIso = (v: string) => { const [y, m, d] = v.split("-").map(Number); return { y, m: m - 1, d } }
const WDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const
const navBtn = "rounded-[var(--radius-md)] p-1.5 text-[var(--mn-text-muted)] hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]"

/* ── Types ── */

export interface MnDatePickerProps extends VariantProps<typeof datePickerVariants> {
  value?: string
  onChange?: (date: string) => void
  min?: string
  max?: string
  disabledDates?: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

/* ── Component ── */

function MnDatePicker({
  value, onChange, min, max, disabledDates, placeholder = "Select date",
  disabled, size, className,
}: MnDatePickerProps) {
  const today = React.useMemo(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() } }, [])
  const sel = value ? parseIso(value) : null
  const [viewY, setViewY] = React.useState(sel?.y ?? today.y)
  const [viewM, setViewM] = React.useState(sel?.m ?? today.m)
  const [focusDay, setFocusDay] = React.useState(sel?.d ?? today.d)
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const disSet = React.useMemo(() => new Set(disabledDates ?? []), [disabledDates])

  const isDis = React.useCallback((y: number, m: number, d: number) => {
    const s = iso(y, m, d)
    return disSet.has(s) || (!!min && s < min) || (!!max && s > max)
  }, [disSet, min, max])

  React.useEffect(() => {
    if (!value) return
    const s = parseIso(value); setViewY(s.y); setViewM(s.m); setFocusDay(s.d)
  }, [value])

  const totalDays = daysIn(viewY, viewM)
  const offset = startDow(viewY, viewM)

  const nav = (dm: number) => {
    let y = viewY, m = viewM + dm
    if (m > 11) { m = 0; y++ } else if (m < 0) { m = 11; y-- }
    setViewY(y); setViewM(m); setFocusDay((d) => Math.min(d, daysIn(y, m)))
  }

  const selectDay = (d: number) => { if (!isDis(viewY, viewM, d)) { onChange?.(iso(viewY, viewM, d)); setOpen(false) } }

  const handleGridKey = (e: React.KeyboardEvent) => {
    const mx = daysIn(viewY, viewM)
    switch (e.key) {
      case "ArrowRight": e.preventDefault()
        if (focusDay < mx) setFocusDay(focusDay + 1); else { nav(1); setFocusDay(1) }; break
      case "ArrowLeft": e.preventDefault()
        if (focusDay > 1) setFocusDay(focusDay - 1)
        else { const pM = viewM === 0 ? 11 : viewM - 1, pY = viewM === 0 ? viewY - 1 : viewY; nav(-1); setFocusDay(daysIn(pY, pM)) }; break
      case "ArrowDown": e.preventDefault()
        if (focusDay + 7 <= mx) setFocusDay(focusDay + 7); else { const ov = focusDay + 7 - mx; nav(1); setFocusDay(ov) }; break
      case "ArrowUp": e.preventDefault()
        if (focusDay - 7 >= 1) setFocusDay(focusDay - 7)
        else { const pM = viewM === 0 ? 11 : viewM - 1, pY = viewM === 0 ? viewY - 1 : viewY; nav(-1); setFocusDay(daysIn(pY, pM) + (focusDay - 7)) }; break
      case "Home": e.preventDefault(); setFocusDay(1); break
      case "End": e.preventDefault(); setFocusDay(mx); break
      case "PageDown": e.preventDefault(); nav(e.shiftKey ? 12 : 1); break
      case "PageUp": e.preventDefault(); nav(e.shiftKey ? -12 : -1); break
      case "Enter": case " ": e.preventDefault(); selectDay(focusDay); break
      case "Escape": e.preventDefault(); setOpen(false); break
    }
  }

  React.useEffect(() => {
    if (!open) return
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`)?.focus()
  }, [focusDay, open, viewM, viewY])

  React.useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h)
  }, [open])

  const monthLabel = new Date(viewY, viewM).toLocaleDateString(undefined, { month: "long", year: "numeric" })

  return (
    <div ref={containerRef} data-slot="mn-date-picker" className={cn(datePickerVariants({ size }), className)}>
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
        <svg aria-hidden="true" className="size-4 shrink-0 text-[var(--mn-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className={cn(!value && "text-[var(--mn-text-muted)]")}>{value ?? placeholder}</span>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Date picker" className={cn(
          "absolute z-50 mt-1 rounded-[var(--radius-md)] border border-[var(--mn-border)]",
          "bg-[var(--mn-surface-raised)] p-3 shadow-[var(--shadow-deep)]",
        )}>
          <div className="mb-2 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => nav(-1)} className={navBtn}>◀</button>
            <span className="font-semibold text-[var(--mn-text)] font-[var(--font-display)]">{monthLabel}</span>
            <button type="button" aria-label="Next month" onClick={() => nav(1)} className={navBtn}>▶</button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-xs text-[var(--mn-text-muted)]">
            {WDAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div ref={gridRef} role="grid" aria-label={monthLabel} className="grid grid-cols-7 gap-px" onKeyDown={handleGridKey}>
            {Array.from({ length: offset }, (_, i) => <span key={`e-${i}`} />)}
            {Array.from({ length: totalDays }, (_, i) => {
              const d = i + 1
              const isToday = d === today.d && viewM === today.m && viewY === today.y
              const isSel = sel ? d === sel.d && viewM === sel.m && viewY === sel.y : false
              const isD = isDis(viewY, viewM, d)
              return (
                <button key={d} type="button" role="gridcell" data-day={d} tabIndex={d === focusDay ? 0 : -1}
                  aria-selected={isSel} aria-disabled={isD || undefined}
                  className={dayVariants({ today: isToday, selected: isSel, disabled: isD })}
                  onClick={() => selectDay(d)}>{d}</button>
              )
            })}
          </div>
          <button type="button" onClick={() => { setViewY(today.y); setViewM(today.m); setFocusDay(today.d) }}
            className="mt-2 w-full rounded-[var(--radius-md)] px-2 py-1 text-center text-xs font-medium text-[var(--mn-accent)] hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]">
            Today
          </button>
        </div>
      )}
    </div>
  )
}

export { MnDatePicker, datePickerVariants, dayVariants }
