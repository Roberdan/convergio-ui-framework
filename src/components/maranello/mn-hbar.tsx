"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export interface HBarItem { label: string; value: number; color?: string }
export interface MnHbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof hbarVariants> {
  bars: HBarItem[]; title?: string; unit?: string; maxValue?: number
  showValues?: boolean; showGrid?: boolean; sortDescending?: boolean
  animate?: boolean; barHeight?: number
  onBarClick?: (bar: HBarItem, index: number) => void
}

const hbarVariants = cva("relative w-full", {
  variants: { size: { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", full: "w-full" } },
  defaultVariants: { size: "full" },
})

function hexLum(hex: string): number {
  let h = hex.replace("#", "")
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const [r, g, b] = [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)].map((s) => parseInt(s, 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
function normHex(c: string | undefined): string {
  if (!c) return "var(--mn-accent, #4EA8DE)"
  if (/^#[0-9A-Fa-f]{6}$/.test(c)) return c
  if (/^#[0-9A-Fa-f]{3}$/.test(c)) return "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]
  return "var(--mn-accent, #4EA8DE)"
}
function isHex6(c: string) { return /^#[0-9A-Fa-f]{6}$/.test(c) }
function ticks(max: number) { return Array.from({ length: 5 }, (_, i) => Math.round((max / 4) * i * 100) / 100) }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

function HBarRow({ bar, index, maxValue, barHeight, showValues, animate, unit, onBarClick }: {
  bar: HBarItem & { _c: string }; index: number; maxValue: number; barHeight: number
  showValues: boolean; animate: boolean; unit: string; onBarClick?: (b: HBarItem, i: number) => void
}) {
  const [mounted, setMounted] = React.useState(!animate)
  const [active, setActive] = React.useState(false)
  const pct = clamp((bar.value / maxValue) * 100, 0, 100)
  const tc = isHex6(bar._c) && hexLum(bar._c) > 0.55 ? "var(--mn-text-strong, #111)" : "var(--mn-text-on-accent, #fff)"

  React.useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setMounted(true), index * 50)
    return () => clearTimeout(t)
  }, [animate, index])

  return (
    <div
      className={cn("group flex items-center gap-3", active && "ring-2 ring-[var(--mn-accent,_#FFC72C)] rounded")}
      role="listitem" title={`${bar.label}: ${bar.value}${unit}`}
      onClick={() => { setActive((a) => !a); onBarClick?.(bar, index) }}
      style={{ cursor: onBarClick ? "pointer" : undefined }}
    >
      <div className="shrink-0 truncate text-right text-sm font-medium text-[var(--mn-text-default,_currentColor)]" style={{ width: "6rem" }}>{bar.label}</div>
      <div className="relative flex-1 rounded bg-[var(--mn-surface-subtle,_#f3f4f6)]">
        <div className="flex items-center justify-end rounded px-2 transition-[width] duration-500 ease-out"
          style={{ width: mounted ? `${pct}%` : "0%", height: `${barHeight}px`, background: bar._c, minWidth: bar.value > 0 ? "2rem" : undefined }}>
          {showValues && <span className="whitespace-nowrap text-xs font-semibold" style={{ color: tc }}>{bar.value}{unit}</span>}
        </div>
      </div>
    </div>
  )
}

function GridLines({ max }: { max: number }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {ticks(max).map((t) => <div key={t} className="absolute top-0 h-full border-l border-[var(--mn-border-subtle,_#e5e7eb)]" style={{ left: `${(t / max) * 100}%` }} />)}
    </div>
  )
}

function Axis({ max, unit }: { max: number; unit: string }) {
  return (
    <div className="relative mt-1 flex" style={{ marginLeft: "6rem", paddingLeft: "0.75rem" }}>
      {ticks(max).map((t) => <div key={t} className="absolute text-xs text-[var(--mn-text-muted,_#9ca3af)]" style={{ left: `${(t / max) * 100}%`, transform: "translateX(-50%)" }}>{t}{unit}</div>)}
    </div>
  )
}

export function MnHbar({ bars, title, unit = "", maxValue: mvp, showValues = true, showGrid = true,
  sortDescending = true, animate = true, barHeight = 28, size, onBarClick, className, ...props }: MnHbarProps) {
  const maxValue = mvp && mvp > 0 ? mvp : 100
  const norm = React.useMemo(() => {
    const m = bars.map((b, i) => ({ ...b, label: b.label ?? `Item ${i + 1}`, value: Number(b.value ?? 0), _c: normHex(b.color) }))
    if (sortDescending) m.sort((a, b) => b.value - a.value)
    return m
  }, [bars, sortDescending])
  const top = norm.length > 0 ? norm.reduce((a, b) => (b.value > a.value ? b : a), norm[0]) : null
  const ariaLabel = top ? `Bar chart: ${norm.length} categories, highest ${top.label} at ${top.value}` : (title || "Horizontal bar chart")

  return (
    <div {...props} className={cn(hbarVariants({ size }), className)} role="img" aria-label={ariaLabel}>
      {title && <div className="mb-2 text-sm font-semibold text-[var(--mn-text-strong,_currentColor)]">{title}</div>}
      <div className="relative">
        <div className="relative">
          {showGrid && <div className="absolute inset-0" style={{ marginLeft: "6.75rem" }}><GridLines max={maxValue} /></div>}
          <div className="flex flex-col gap-1.5" role="list">
            {norm.map((bar, i) => (
              <HBarRow key={bar.label + i} bar={bar} index={i} maxValue={maxValue} barHeight={barHeight}
                showValues={showValues} animate={animate} unit={unit} onBarClick={onBarClick} />
            ))}
          </div>
        </div>
        <Axis max={maxValue} unit={unit} />
      </div>
    </div>
  )
}
