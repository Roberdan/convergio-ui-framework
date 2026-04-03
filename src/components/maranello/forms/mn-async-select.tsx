"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Variants ── */

const asyncSelectVariants = cva("relative inline-block w-full font-[var(--font-body)]", {
  variants: { size: { sm: "text-sm", default: "text-sm", lg: "text-base" } },
  defaultVariants: { size: "default" },
})

const inputCls = cn(
  "w-full rounded-[var(--radius-md)] border border-[var(--mn-border)]",
  "bg-[var(--mn-surface-raised)] px-3 py-2 text-[var(--mn-text)]",
  "placeholder:text-[var(--mn-text-muted)] outline-none transition-colors",
  "focus:ring-2 focus:ring-[var(--mn-accent)] disabled:cursor-not-allowed disabled:opacity-50",
)

const dropCls = cn(
  "absolute z-50 mt-1 w-full overflow-auto rounded-[var(--radius-md)] max-h-60",
  "border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] shadow-[var(--shadow-deep)]",
)

const itemVariants = cva("cursor-pointer px-3 py-2 text-[var(--mn-text)] transition-colors", {
  variants: {
    active: {
      true: "bg-[var(--mn-accent)] text-[var(--mn-text-inverse)]",
      false: "hover:bg-[var(--mn-accent)]/10",
    },
  },
  defaultVariants: { active: false },
})

/* ── Types ── */

export interface AsyncSelectItem { id: string; label: string; [key: string]: unknown }
export type AsyncSelectProvider = (query: string) => Promise<AsyncSelectItem[]>

export interface MnAsyncSelectProps extends VariantProps<typeof asyncSelectVariants> {
  provider: AsyncSelectProvider
  placeholder?: string
  /** Minimum characters before triggering search. @default 1 */
  minChars?: number
  /** Debounce delay in ms. @default 300 */
  debounce?: number
  onSelect?: (item: AsyncSelectItem) => void
  disabled?: boolean
  className?: string
}

/* ── Component ── */

function MnAsyncSelect({
  provider, placeholder = "Search…", minChars = 1, debounce: debounceMs = 300,
  onSelect, disabled, size, className,
}: MnAsyncSelectProps) {
  const [query, setQuery] = React.useState("")
  const [items, setItems] = React.useState<AsyncSelectItem[]>([])
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const reqId = React.useRef(0)
  const listboxId = React.useId()

  const search = React.useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (q.length < minChars) { setItems([]); setOpen(false); return }
    timerRef.current = setTimeout(async () => {
      const id = ++reqId.current
      setLoading(true); setError(null)
      try {
        const result = await provider(q)
        if (id !== reqId.current) return
        setItems(result); setActiveIndex(-1); setOpen(true)
      } catch {
        if (id !== reqId.current) return
        setError("Failed to load results"); setItems([])
      } finally { if (id === reqId.current) setLoading(false) }
    }, debounceMs)
  }, [provider, minChars, debounceMs])

  const select = React.useCallback((item: AsyncSelectItem) => {
    setQuery(item.label); setOpen(false); setItems([]); onSelect?.(item)
  }, [onSelect])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || !items.length) { if (e.key === "Escape") setOpen(false); return }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActiveIndex((i) => (i + 1) % items.length); break
      case "ArrowUp": e.preventDefault(); setActiveIndex((i) => (i - 1 + items.length) % items.length); break
      case "Enter": e.preventDefault(); if (activeIndex >= 0) select(items[activeIndex]); break
      case "Escape": e.preventDefault(); setOpen(false); break
      case "Tab": setOpen(false); break
    }
  }

  React.useEffect(() => {
    if (activeIndex < 0) return
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  React.useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      const root = inputRef.current?.parentElement
      if (root && !root.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <div data-slot="mn-async-select" className={cn(asyncSelectVariants({ size }), className)}>
      <input
        ref={inputRef} type="text" role="combobox" aria-expanded={open}
        aria-controls={listboxId} aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
        placeholder={placeholder} value={query} disabled={disabled}
        onChange={(e) => { setQuery(e.target.value); search(e.target.value) }}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (items.length) setOpen(true) }}
        className={inputCls}
      />
      {open && (
        <ul ref={listRef} id={listboxId} role="listbox" className={dropCls}>
          {loading && (
            <li className="flex items-center gap-2 px-3 py-2 text-[var(--mn-text-muted)]">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading…
            </li>
          )}
          {error && <li className="px-3 py-2 text-[var(--mn-error)]">{error}</li>}
          {!loading && !error && items.length === 0 && (
            <li className="px-3 py-2 text-[var(--mn-text-muted)]">No results</li>
          )}
          {!loading && !error && items.map((item, i) => (
            <li
              key={item.id} id={`${listboxId}-opt-${i}`} role="option"
              aria-selected={i === activeIndex}
              className={itemVariants({ active: i === activeIndex })}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(item)}
            >{item.label}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { MnAsyncSelect, asyncSelectVariants }
