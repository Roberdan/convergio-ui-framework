"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const controlBase = cva(
  "inline-flex flex-col items-center gap-2 select-none font-[var(--font-body,sans-serif)]",
  { variants: { size: { sm: "text-xs", md: "text-sm", lg: "text-base" } }, defaultVariants: { size: "md" } },
)

interface ControlBase extends VariantProps<typeof controlBase> { label?: string; className?: string }

const LBL = "text-[0.65rem] uppercase tracking-[.08em] text-[var(--mn-text-tertiary,var(--mn-text-muted))]"
const DIAL = "relative cursor-grab active:cursor-grabbing rounded-full border border-[var(--mn-border)] bg-[radial-gradient(circle_at_40%_35%,var(--mn-border),var(--mn-surface-raised))]"

function useStep(controlled: number | undefined, init: number, max: number, positions: string[], onChange?: (i: number, l: string) => void) {
  const [internal, setInternal] = React.useState(init)
  const idx = controlled ?? internal
  const go = React.useCallback((n: number) => {
    const c = Math.max(0, Math.min(max, n))
    if (controlled === undefined) setInternal(c)
    onChange?.(c, positions[c])
  }, [controlled, max, onChange, positions])
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); go(idx + 1) }
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); go(idx - 1) }
    else if (e.key === "Home") { e.preventDefault(); go(0) }
    else if (e.key === "End") { e.preventDefault(); go(max) }
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
  const ARC = 240, START = -120
  const angle = count > 1 ? START + (idx / (count - 1)) * ARC : 0
  return (
    <div className={cn(controlBase({ size }), className)}>
      {label && <span className={LBL}>{label}</span>}
      <div className="relative h-[160px] w-[160px]">
        {/* Outer ring */}
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--mn-border)] pointer-events-none" />
        {/* Position labels arranged radially */}
        {positions.map((p, i) => {
          const a = count > 1 ? START + (i / (count - 1)) * ARC : 0
          const rad = ((a - 90) * Math.PI) / 180
          const r = 70
          return (
            <button key={i} onClick={() => go(i)}
              className={cn("absolute whitespace-nowrap text-[0.55rem] uppercase tracking-[.04em] -translate-x-1/2 -translate-y-1/2 transition-colors duration-150",
                i === idx ? "font-bold text-[var(--mn-text)]" : "text-[var(--mn-text-muted)] hover:text-[var(--mn-text-secondary)]")}
              style={{ left: 80 + Math.cos(rad) * r, top: 80 + Math.sin(rad) * r }}>
              {p}
            </button>
          )
        })}
        {/* Knob */}
        <div role="slider" aria-label={label ?? "Manettino selector"} aria-valuemin={0} aria-valuemax={count - 1}
          aria-valuenow={idx} aria-valuetext={positions[idx]} tabIndex={0} onKeyDown={onKey}
          className={cn(DIAL, "absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2",
            "shadow-[0_3px_8px_rgba(0,0,0,.55),inset_0_1px_1px_rgba(255,255,255,.2)]",
            "active:shadow-[0_1px_4px_rgba(0,0,0,.7),inset_0_1px_1px_rgba(255,255,255,.15)]")}
          style={{ transform: `translate(-50%,-50%) rotate(${angle}deg)` }}
          onClick={() => go((idx + 1) % count)}>
          {/* Pointer notch */}
          <div className="absolute left-1/2 top-1.5 h-[18px] w-0.5 -translate-x-1/2 rounded-sm bg-[var(--mn-text)] pointer-events-none" />
        </div>
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
      <div className="relative flex items-center gap-2">
        <div className="flex h-[120px] flex-col justify-between">
          {positions.map((p, i) => (
            <button key={i} onClick={() => go(i)} className={cn(
              "text-[0.55rem] uppercase tracking-[.06em] transition-colors duration-150",
              i === idx ? "font-bold text-[var(--mn-accent)]" : "text-[var(--mn-text-muted)] hover:text-[var(--mn-text-secondary)]",
            )}>{p}</button>
          ))}
        </div>
        <div ref={railRef}
          className="relative h-[120px] w-3.5 rounded-[7px] bg-[linear-gradient(180deg,var(--mn-surface-raised),var(--mn-text-inverse,var(--mn-surface-sunken)))] shadow-[inset_0_1px_3px_rgba(0,0,0,.6)]">
          {positions.map((_, i) => (
            <button key={i} aria-label={positions[i]}
              className="absolute left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-[var(--mn-text-muted)] opacity-30"
              style={{ top: `${(i / (count - 1)) * 100}%` }} onClick={() => go(i)} />
          ))}
          <div role="slider" tabIndex={0} aria-label={label ?? "Cruise lever"} aria-valuemin={0}
            aria-valuemax={count - 1} aria-valuenow={idx} aria-valuetext={positions[idx]} onKeyDown={onKey}
            onMouseDown={onPointerStart} onTouchStart={onPointerStart}
            className={cn(
              "absolute left-1/2 h-[18px] w-[30px] -translate-x-1/2 -translate-y-1/2 rounded",
              "bg-[linear-gradient(180deg,var(--mn-text-tertiary,var(--mn-border)),var(--mn-border))]",
              "shadow-[0_2px_4px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.3)]",
              dragging ? "cursor-grabbing scale-105" : "cursor-grab transition-[top] duration-150 ease-out",
            )}
            style={{ top: `${pct}%` }} />
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
        className={cn(
          "relative h-7 w-[52px] cursor-pointer rounded-full transition-shadow duration-150",
          "bg-[linear-gradient(180deg,var(--mn-text-inverse,var(--mn-surface-sunken)),var(--mn-surface-raised))]",
          "shadow-[inset_0_2px_4px_rgba(0,0,0,.6),0_1px_0_rgba(255,255,255,.05)]",
          on && "shadow-[inset_0_2px_4px_rgba(0,0,0,.6),0_0_8px_rgba(255,199,44,.25)]",
        )}>
        {/* Lever knob */}
        <div className={cn(
          "absolute top-[3px] h-[22px] w-[22px] rounded-full",
          "bg-[linear-gradient(135deg,var(--mn-text-tertiary,var(--mn-border)),var(--mn-border))]",
          "shadow-[0_2px_4px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.35)]",
          "transition-[left] duration-150 ease-out",
          on ? "left-[27px]" : "left-[3px]",
        )} />
        {/* Indicator LED */}
        <div className={cn(
          "absolute right-2 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full transition-all duration-150",
          on ? "bg-[var(--mn-accent)] shadow-[0_0_4px_var(--mn-accent)]" : "bg-[var(--mn-border)]",
        )} />
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
  const ARC = 180, START = -90
  const angleFor = (i: number) => START + (count > 1 ? (i / (count - 1)) * ARC : 0)
  const angle = angleFor(idx)
  const TICK_R = 30, LABEL_R = 44
  return (
    <div className={cn(controlBase({ size }), className)}>
      {label && <span className={LBL}>{label}</span>}
      <div className="relative h-[100px] w-[100px]">
        {/* Tick marks */}
        {positions.map((_, i) => {
          const a = angleFor(i)
          const rad = ((a - 90) * Math.PI) / 180
          return (
            <div key={`t${i}`}
              className={cn("absolute h-2 w-0.5 rounded-sm transition-colors duration-150 pointer-events-none",
                i === idx ? "bg-[var(--mn-accent)]" : "bg-[var(--mn-border)]")}
              style={{ left: 50 + Math.cos(rad) * TICK_R, top: 50 + Math.sin(rad) * TICK_R,
                transform: `translate(-50%,-50%) rotate(${a}deg)` }} />
          )
        })}
        {/* Knob */}
        <div role="slider" aria-label={label ?? "Stepped rotary"} aria-valuemin={0} aria-valuemax={count - 1}
          aria-valuenow={idx} aria-valuetext={positions[idx]} tabIndex={0} onKeyDown={onKey}
          className={cn(DIAL, "absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2",
            "shadow-[0_2px_6px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.15)]",
            "active:shadow-[0_1px_3px_rgba(0,0,0,.6)]")}
          style={{ transform: `translate(-50%,-50%) rotate(${angle}deg)` }}
          onClick={() => go((idx + 1) % count)}>
          <div className="absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 rounded-sm bg-[var(--mn-text)] pointer-events-none" />
        </div>
        {/* Position labels */}
        {positions.map((p, i) => {
          const a = angleFor(i)
          const rad = ((a - 90) * Math.PI) / 180
          return (
            <button key={`l${i}`} onClick={() => go(i)}
              className={cn("absolute -translate-x-1/2 -translate-y-1/2 text-[0.55rem] uppercase tracking-[.04em] transition-colors duration-150",
                i === idx ? "font-bold text-[var(--mn-accent)]" : "text-[var(--mn-text-muted)] hover:text-[var(--mn-text-secondary)]")}
              style={{ left: 50 + Math.cos(rad) * LABEL_R, top: 50 + Math.sin(rad) * LABEL_R }}>
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { MnManettino, MnCruiseLever, MnToggleLever, MnSteppedRotary }
export type { MnManettinoProps, MnCruiseLeverProps, MnToggleLeverProps, MnSteppedRotaryProps }
