"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cva } from "class-variance-authority"
import { Loader2, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const searchDrawerBackdropVariants = cva(
  "fixed inset-0 z-[9500] bg-black/50 transition-opacity duration-200",
  {
    variants: {
      visible: {
        true: "opacity-100 pointer-events-auto",
        false: "opacity-0 pointer-events-none",
      },
    },
    defaultVariants: { visible: false },
  },
)

const searchDrawerVariants = cva(
  "fixed inset-y-0 right-0 z-[9501] flex w-[400px] max-w-[90vw] flex-col border-l border-border bg-background shadow-2xl transition-transform duration-200",
  {
    variants: {
      visible: {
        true: "translate-x-0",
        false: "translate-x-full",
      },
    },
    defaultVariants: { visible: false },
  },
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchDrawerResult {
  id: string
  title: string
  subtitle?: string
  badge?: string
  icon?: React.ReactNode
}

export interface SearchDrawerSection {
  id: string
  label: string
  content: React.ReactNode
}

export interface MnSearchDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** @default "Search…" */
  placeholder?: string
  onSearch: (query: string) => Promise<SearchDrawerResult[]>
  onResultClick?: (result: SearchDrawerResult) => void
  sections?: SearchDrawerSection[]
  /** @default "No results found" */
  emptyMessage?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function MnSearchDrawer({
  open,
  onOpenChange,
  title,
  placeholder = "Search\u2026",
  onSearch,
  onResultClick,
  sections,
  emptyMessage = "No results found",
  className,
}: MnSearchDrawerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const drawerRef = React.useRef<HTMLDivElement>(null)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchDrawerResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searched, setSearched] = React.useState(false)
  const [focusIdx, setFocusIdx] = React.useState(-1)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = React.useCallback(() => onOpenChange(false), [onOpenChange])

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setLoading(false)
      setSearched(false)
      setFocusIdx(-1)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Debounced async search
  React.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const q = query.trim()
    if (!q) {
      setResults([])
      setLoading(false)
      setSearched(false)
      return
    }
    setLoading(true)
    timerRef.current = setTimeout(() => {
      onSearch(q)
        .then((res) => setResults(res))
        .catch(() => setResults([]))
        .finally(() => {
          setLoading(false)
          setSearched(true)
        })
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, onSearch])

  React.useEffect(() => {
    setFocusIdx(-1)
  }, [results])

  // Body scroll lock
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Focus trap + Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== "Tab" || !drawerRef.current) return
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, input, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, close])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusIdx((i) => Math.min(i + 1, results.length - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusIdx((i) => Math.max(i - 1, 0))
          break
        case "Enter":
          if (focusIdx >= 0 && focusIdx < results.length) {
            e.preventDefault()
            onResultClick?.(results[focusIdx])
          }
          break
      }
    },
    [results, focusIdx, onResultClick],
  )

  // SSR guard
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const showEmpty = searched && !loading && results.length === 0

  return createPortal(
    <>
      <div
        className={searchDrawerBackdropVariants({ visible: open })}
        onClick={close}
        aria-hidden
        data-slot="mn-search-drawer-backdrop"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(searchDrawerVariants({ visible: open }), className)}
        data-slot="mn-search-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3" data-slot="mn-search-drawer-header">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-slot="mn-search-drawer-close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5" data-slot="mn-search-drawer-search">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={placeholder}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            data-slot="mn-search-drawer-input"
          />
          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" data-slot="mn-search-drawer-body">
          {results.length > 0 && (
            <div role="listbox" aria-label="Search results" className="py-1" data-slot="mn-search-drawer-results">
              {results.map((r, i) => (
                <div
                  key={r.id}
                  role="option"
                  aria-selected={i === focusIdx}
                  data-idx={i}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                    i === focusIdx ? "bg-muted" : "hover:bg-muted/50",
                  )}
                  onClick={() => onResultClick?.(r)}
                  onMouseEnter={() => setFocusIdx(i)}
                  data-slot="mn-search-drawer-item"
                >
                  {r.icon && <span className="shrink-0 text-muted-foreground">{r.icon}</span>}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-foreground">{r.title}</span>
                    {r.subtitle && <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>}
                  </span>
                  {r.badge && (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                      {r.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground" data-slot="mn-search-drawer-empty">
              {emptyMessage}
            </div>
          )}

          {sections?.map((s) => (
            <div key={s.id} className="border-t border-border px-4 py-3" data-slot="mn-search-drawer-section">
              <div className="pb-1.5 text-[0.7rem] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              {s.content}
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body,
  )
}

export { MnSearchDrawer, searchDrawerBackdropVariants, searchDrawerVariants }
