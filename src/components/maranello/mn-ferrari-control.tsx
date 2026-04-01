"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const controlBase = cva(
  "inline-flex flex-col items-center gap-2 select-none font-[var(--font-body,sans-serif)]",
  { variants: { size: { sm: "text-xs", md: "text-sm", lg: "text-base" } }, defaultVariants: { size: "md" } },
)

interface ControlBase extends VariantProps<typeof controlBase> { label?: string; className?: string }

const LBL = "text-[0.7rem] uppercase tracking-widest text-[var(--mn-text-muted)]"
const DIAL = "relative cursor-pointer rounded-full border border-[var(--mn-border)] bg-[linear-gradient(145deg,var(--mn-surface-raised),var(--mn-surface-sunken))]"

function useStep(controlled: number | undefined, init: number, max: number, positions: string[], onChange?: (i: number, l: string) => void) {
  const [internal, setInternal] = React.useState(init)
  const idx = controlled ?? internal
  const go = (n: number) => { const c = Math.max(0, Math.min(max, n)); if (controlled === undefined) setInternal(c); onChange?.(c, positions[c]) }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); go(idx + 1) }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); go(idx - 1) }
  }
  return { idx, go, onKey } as const
}

/* ── Manettino ─────────────────────────────────────────────── */

interface MnManettinoProps extends ControlBase {
  positions?: string[]; value?: number; defaultValue?: number
  onChange?: (index: number, label: string) => void
}

function MnManettino({ positions = ["WET", "COMFORT", "SPORT", "RACE", "ESC OFF"], value: controlled, defaultValue = 2, onChange, label, size, className }: MnManettinoProps) {
  const count = positions.length
  const { idx, go, onKey } = useStep(controlled, defaultValue, count - 1, positions, onChange)
  const angle = count > 1 ? (idx / (count - 1)) * 240 - 120 : 0
  return (
    <div className={cn(controlBase({ size }), className)}>
      {label && <span className={LBL}>{label}</span>}
      <div role="slider" aria-label={label ?? "Manettino selector"} aria-valuemin={0} aria-valuemax={count - 1}
        aria-valuenow={idx} aria-valuetext={positions[idx]} tabIndex={0} onKeyDown={onKey}
        className={cn(DIAL, "h-16 w-16 shadow-[inset_0_1px_2px_rgba(255,255,255,.12),0_2px_6px_rgba(0,0,0,.4)]")}
        onClick={() => go((idx + 1) % count)}>
        <div className="absolute left-1/2 top-1 h-5 w-0.5 origin-[center_30px] rounded bg-[var(--mn-accent)] transition-transform duration-200"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
      </div>
      <span className="text-[0.65rem] font-semibold tracking-wide text-[var(--mn-text-secondary)]">{positions[idx]}</span>
    </div>
  )
}

/* ── Cruise Lever ──────────────────────────────────────────── */

interface MnCruiseLeverProps extends ControlBase {
  positions?: string[]; value?: number; defaultValue?: number
  onChange?: (index: number, label: string) => void
}

function MnCruiseLever({ positions = ["OFF", "SET", "RES", "ACC"], value: controlled, defaultValue = 0, onChange, label, size, className }: MnCruiseLeverProps) {
  const count = positions.length
  const { idx, go, onKey } = useStep(controlled, defaultValue, count - 1, positions, onChange)
  const pct = count > 1 ? (idx / (count - 1)) * 100 : 0
  const railRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)

  const resolveIndex = React.useCallback((clientY: number) => {
    const rail = railRef.current
    if (!rail) return
    const { top, height } = rail.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientY - top) / height))
    go(Math.round(ratio * (count - 1)))
  }, [count, go])

  React.useEffect(() => {
    if (!dragging) return
    function onMove(e: MouseEvent) { resolveIndex(e.clientY) }
    function onUp() { setDragging(false) }
    function onTouchMove(e: TouchEvent) { resolveIndex(e.touches[0].clientY) }
    function onTouchEnd() { setDragging(false) }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    document.addEventListener("touchmove", onTouchMove, { passive: true })
    document.addEventListener("touchend", onTouchEnd)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }
  }, [dragging, resolveIndex])

  function onPointerStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    setDragging(true)
  }

  return (
    <div className={cn(controlBase({ size }), className)}>
      {label && <span className={LBL}>{label}</span>}
      <div className="relative flex items-center gap-3">
        <div ref={railRef} className="relative h-28 w-3 rounded-full border border-[var(--mn-border)] bg-[linear-gradient(180deg,var(--mn-surface-raised),var(--mn-surface-sunken))]">
          {positions.map((_, i) => (
            <button key={i} aria-label={positions[i]}
              className="absolute left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--mn-text-muted)] opacity-40"
              style={{ top: `${(i / (count - 1)) * 100}%` }} onClick={() => go(i)} />
          ))}
          <div role="slider" tabIndex={0} aria-label={label ?? "Cruise lever"} aria-valuemin={0}
            aria-valuemax={count - 1} aria-valuenow={idx} aria-valuetext={positions[idx]} onKeyDown={onKey}
            onMouseDown={onPointerStart} onTouchStart={onPointerStart}
            className={cn(
              "absolute left-1/2 h-4 w-5 -translate-x-1/2 -translate-y-1/2 rounded border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] shadow-[0_1px_4px_rgba(0,0,0,.35)]",
              dragging ? "cursor-grabbing scale-110" : "cursor-grab transition-[top] duration-150",
            )}
            style={{ top: `${pct}%` }} />
        </div>
        <div className="flex h-28 flex-col justify-between">
          {positions.map((p, i) => (
            <span key={i} className={cn("text-[0.6rem] uppercase tracking-wide transition-colors",
              i === idx ? "font-bold text-[var(--mn-accent)]" : "text-[var(--mn-text-muted)]")}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Toggle Lever ──────────────────────────────────────────── */

interface MnToggleLeverProps extends ControlBase {
  pressed?: boolean; defaultPressed?: boolean; onChange?: (on: boolean) => void
}

function MnToggleLever({ pressed: controlled, defaultPressed = false, onChange, label, size, className }: MnToggleLeverProps) {
  const [internal, setInternal] = React.useState(defaultPressed)
  const on = controlled ?? internal
  function toggle() { const next = !on; if (controlled === undefined) setInternal(next); onChange?.(next) }
  function onKey(e: React.KeyboardEvent) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle() } }
  return (
    <div className={cn(controlBase({ size }), className)}>
      {label && <span className={LBL}>{label}</span>}
      <div role="switch" aria-checked={on} aria-label={label ?? "Toggle lever"} tabIndex={0}
        onClick={toggle} onKeyDown={onKey}
        className={cn("relative h-10 w-5 cursor-pointer rounded-full border border-[var(--mn-border)] transition-colors duration-200",
          on ? "bg-[linear-gradient(180deg,var(--mn-accent),var(--mn-surface-sunken))]"
            : "bg-[linear-gradient(180deg,var(--mn-surface-raised),var(--mn-surface-sunken))]")}>
        <div className={cn("absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-[var(--mn-border)] shadow-[0_1px_3px_rgba(0,0,0,.4)] transition-[top] duration-200",
          on ? "top-0.5 bg-[var(--mn-accent)]" : "top-[calc(100%-18px)] bg-[var(--mn-surface-raised)]")} />
      </div>
      <span className="text-[0.6rem] font-semibold uppercase text-[var(--mn-text-secondary)]">{on ? "ON" : "OFF"}</span>
    </div>
  )
}

/* ── Stepped Rotary ────────────────────────────────────────── */

interface MnSteppedRotaryProps extends ControlBase {
  positions?: string[]; value?: number; defaultValue?: number
  onChange?: (index: number, label: string) => void
}

function MnSteppedRotary({ positions = ["1", "2", "3", "4", "5"], value: controlled, defaultValue = 0, onChange, label, size, className }: MnSteppedRotaryProps) {
  const count = positions.length
  const { idx, go, onKey } = useStep(controlled, defaultValue, count - 1, positions, onChange)
  const angle = count > 1 ? (idx / (count - 1)) * 270 - 135 : 0
  return (
    <div className={cn(controlBase({ size }), className)}>
      {label && <span className={LBL}>{label}</span>}
      <div role="slider" aria-label={label ?? "Stepped rotary"} aria-valuemin={0} aria-valuemax={count - 1}
        aria-valuenow={idx} aria-valuetext={positions[idx]} tabIndex={0} onKeyDown={onKey}
        className={cn(DIAL, "h-14 w-14 shadow-[inset_0_1px_2px_rgba(255,255,255,.08),0_2px_5px_rgba(0,0,0,.35)]")}
        onClick={() => go((idx + 1) % count)}>
        <div className="absolute left-1/2 top-1 h-4 w-0.5 origin-[center_25px] rounded bg-[var(--mn-text-secondary)] transition-transform duration-200"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
      </div>
      <div className="flex gap-1.5">
        {positions.map((p, i) => (
          <button key={i} onClick={() => go(i)} className={cn("rounded px-1 py-0.5 text-[0.55rem] uppercase tracking-wide transition-colors",
            i === idx ? "bg-[var(--mn-accent)]/15 font-bold text-[var(--mn-accent)]" : "text-[var(--mn-text-muted)] hover:text-[var(--mn-text-secondary)]")}>{p}</button>
        ))}
      </div>
    </div>
  )
}

export { MnManettino, MnCruiseLever, MnToggleLever, MnSteppedRotary }
export type { MnManettinoProps, MnCruiseLeverProps, MnToggleLeverProps, MnSteppedRotaryProps }
