"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────────── */
export type SwotQuadrant = "strengths" | "weaknesses" | "opportunities" | "threats"

/* ── CVA ───────────────────────────────────────────────────── */
const swotWrap = cva("grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border", {
  variants: {
    size: {
      sm: "max-w-sm text-xs",
      md: "max-w-xl text-sm",
      lg: "max-w-3xl text-sm",
      fluid: "w-full text-sm",
    },
  },
  defaultVariants: { size: "fluid" },
})

/* ── Quadrant metadata (theme-aware tokens, no hardcoded colors) */
const QUADRANTS: readonly {
  key: SwotQuadrant; label: string; letter: string; token: string
}[] = [
  { key: "strengths", label: "Strengths", letter: "S", token: "--chart-2" },
  { key: "weaknesses", label: "Weaknesses", letter: "W", token: "--chart-5" },
  { key: "opportunities", label: "Opportunities", letter: "O", token: "--chart-1" },
  { key: "threats", label: "Threats", letter: "T", token: "--chart-3" },
]

/* ── Props ─────────────────────────────────────────────────── */
export interface MnSwotProps extends VariantProps<typeof swotWrap> {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  /** Enable add / remove / inline-edit per quadrant. */
  editable?: boolean
  /** Fires after any mutation with the affected quadrant and its updated items. */
  onChange?: (quadrant: SwotQuadrant, items: string[]) => void
  ariaLabel?: string
  className?: string
}

/* ── Internals ─────────────────────────────────────────────── */
interface SwotEntry { id: string; text: string }

let _seq = 0
function nextId(): string { return `swi-${++_seq}` }

function toEntries(arr: string[]): SwotEntry[] {
  return arr.map((t) => ({ id: nextId(), text: t }))
}

/* ── Component ─────────────────────────────────────────────── */
export function MnSwot({
  strengths, weaknesses, opportunities, threats,
  editable = false, onChange,
  ariaLabel = "SWOT Analysis", size, className,
}: MnSwotProps) {
  /* Editable internal store (initialised from props) */
  const [store, setStore] = React.useState<Record<SwotQuadrant, SwotEntry[]>>(() => ({
    strengths: toEntries(strengths), weaknesses: toEntries(weaknesses),
    opportunities: toEntries(opportunities), threats: toEntries(threats),
  }))

  /* Non-editable: derive entries directly from props */
  const propEntries = React.useMemo<Record<SwotQuadrant, SwotEntry[]>>(() => ({
    strengths: strengths.map((t, i) => ({ id: `ps-${i}`, text: t })),
    weaknesses: weaknesses.map((t, i) => ({ id: `pw-${i}`, text: t })),
    opportunities: opportunities.map((t, i) => ({ id: `po-${i}`, text: t })),
    threats: threats.map((t, i) => ({ id: `pt-${i}`, text: t })),
  }), [strengths, weaknesses, opportunities, threats])

  const entries = editable ? store : propEntries

  const [inputVals, setInputVals] = React.useState<Record<SwotQuadrant, string>>(
    { strengths: "", weaknesses: "", opportunities: "", threats: "" },
  )
  const [editId, setEditId] = React.useState<string | null>(null)
  const [editText, setEditText] = React.useState("")

  /* ── Mutations (editable mode only) ──────────────────────── */
  const notify = React.useCallback(
    (q: SwotQuadrant, list: SwotEntry[]) => onChange?.(q, list.map((e) => e.text)),
    [onChange],
  )

  const add = React.useCallback((q: SwotQuadrant) => {
    const text = inputVals[q].trim()
    if (!text) return
    setStore((prev) => {
      const updated = [...prev[q], { id: nextId(), text }]
      notify(q, updated)
      return { ...prev, [q]: updated }
    })
    setInputVals((p) => ({ ...p, [q]: "" }))
  }, [inputVals, notify])

  const remove = React.useCallback((q: SwotQuadrant, id: string) => {
    setStore((prev) => {
      const updated = prev[q].filter((e) => e.id !== id)
      notify(q, updated)
      return { ...prev, [q]: updated }
    })
  }, [notify])

  const beginEdit = React.useCallback((entry: SwotEntry) => {
    setEditId(entry.id); setEditText(entry.text)
  }, [])

  const commitEdit = React.useCallback((q: SwotQuadrant) => {
    if (!editId) return
    const trimmed = editText.trim()
    if (!trimmed) { setEditId(null); return }
    setStore((prev) => {
      const updated = prev[q].map((e) => (e.id === editId ? { ...e, text: trimmed } : e))
      notify(q, updated)
      return { ...prev, [q]: updated }
    })
    setEditId(null)
  }, [editId, editText, notify])

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div role="region" aria-label={ariaLabel} className={cn(swotWrap({ size }), className)}>
      {QUADRANTS.map((q) => {
        const items = entries[q.key]
        return (
          <div
            key={q.key}
            className="flex min-h-[10rem] flex-col gap-2 bg-card p-4"
            style={{ borderInlineStart: `3px solid hsl(var(${q.token}))` }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold text-primary-foreground"
                style={{ backgroundColor: `hsl(var(${q.token}))` }}
                aria-hidden="true"
              >{q.letter}</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-card-foreground">
                {q.label}
              </h3>
            </div>

            <ul className="flex-1 space-y-1" aria-label={q.label}>
              {items.map((item) => (
                <li key={item.id} className="group flex items-start gap-1.5 text-sm">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `hsl(var(${q.token}))` }}
                    aria-hidden="true"
                  />
                  {editId === item.id ? (
                    <input
                      type="text" value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => commitEdit(q.key)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(q.key)
                        if (e.key === "Escape") setEditId(null)
                      }}
                      className="min-w-0 flex-1 border-b border-border bg-transparent text-card-foreground outline-none focus-visible:border-ring"
                      aria-label={`Edit ${item.text}`} autoFocus
                    />
                  ) : (
                    <span
                      className={cn("flex-1 text-card-foreground", editable && "cursor-text")}
                      role={editable ? "button" : undefined}
                      tabIndex={editable ? 0 : undefined}
                      onClick={editable ? () => beginEdit(item) : undefined}
                      onKeyDown={editable ? (e) => {
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); beginEdit(item) }
                      } : undefined}
                      aria-label={editable ? `Edit: ${item.text}` : undefined}
                    >{item.text}</span>
                  )}
                  {editable && editId !== item.id && (
                    <button
                      type="button" onClick={() => remove(q.key, item.id)}
                      className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                      aria-label={`Remove: ${item.text}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-xs italic opacity-50">No items</li>
              )}
            </ul>

            {editable && (
              <div className="flex items-center gap-1.5 border-t border-border pt-2">
                <input
                  type="text" placeholder={`Add ${q.label.toLowerCase()}...`}
                  value={inputVals[q.key]}
                  onChange={(e) => setInputVals((p) => ({ ...p, [q.key]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") add(q.key) }}
                  className="min-w-0 flex-1 rounded border border-border bg-transparent px-2 py-1 text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label={`New ${q.label.toLowerCase()}`}
                />
                <button
                  type="button" onClick={() => add(q.key)}
                  disabled={!inputVals[q.key].trim()}
                  className="shrink-0 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Add ${q.label.toLowerCase()}`}
                >Add</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { swotWrap }
