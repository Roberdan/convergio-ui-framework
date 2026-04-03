import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

export const controlBase = cva(
  "inline-flex flex-col items-center gap-2 select-none font-[var(--font-body,sans-serif)]",
  { variants: { size: { sm: "text-xs", md: "text-sm", lg: "text-base" } }, defaultVariants: { size: "md" } },
)

export interface ControlBase extends VariantProps<typeof controlBase> { label?: string; className?: string }

export const LBL = "text-[0.65rem] uppercase tracking-[.08em] text-[var(--mn-text-tertiary,var(--mn-text-muted))]"
export const DIAL = "relative cursor-grab active:cursor-grabbing rounded-full border border-[var(--mn-border)] bg-[radial-gradient(circle_at_40%_35%,var(--mn-border),var(--mn-surface-raised))]"

export function useStep(controlled: number | undefined, init: number, max: number, positions: string[], onChange?: (i: number, l: string) => void) {
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
