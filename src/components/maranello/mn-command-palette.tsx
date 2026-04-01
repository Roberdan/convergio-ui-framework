"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const backdropVariants = cva(
  "fixed inset-0 z-[9500] flex items-start justify-center pt-[20vh] bg-black/50 transition-opacity duration-200",
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

export interface CommandItem {
  text: string
  icon?: string
  shortcut?: string
  group?: string
}

export interface MnCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CommandItem[]
  onSelect?: (item: CommandItem) => void
  /** @default "Type a command…" */
  placeholder?: string
  /** Register global Cmd+K / Ctrl+K hotkey. @default true */
  globalHotkey?: boolean
  className?: string
}

function MnCommandPalette({
  open,
  onOpenChange,
  items,
  onSelect,
  placeholder = "Type a command\u2026",
  globalHotkey = true,
  className,
}: MnCommandPaletteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const [query, setQuery] = React.useState("")
  const [focusIdx, setFocusIdx] = React.useState(-1)

  // Filtered items
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase()
    return q ? items.filter((it) => (it.text ?? "").toLowerCase().includes(q)) : items
  }, [items, query])

  // Reset state when opening/closing
  React.useEffect(() => {
    if (open) {
      setQuery("")
      setFocusIdx(-1)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Reset focus index when filtered list changes
  React.useEffect(() => {
    setFocusIdx(-1)
  }, [filtered])

  // Scroll focused item into view
  React.useEffect(() => {
    if (focusIdx < 0) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${focusIdx}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [focusIdx])

  // Global Cmd+K / Ctrl+K hotkey
  React.useEffect(() => {
    if (!globalHotkey) return
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [globalHotkey, open, onOpenChange])

  // Lock body scroll while open
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const close = React.useCallback(() => onOpenChange(false), [onOpenChange])

  const selectItem = React.useCallback(
    (item: CommandItem) => {
      onSelect?.(item)
      close()
    },
    [onSelect, close],
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault()
          close()
          break
        case "ArrowDown":
          e.preventDefault()
          setFocusIdx((i) => Math.min(i + 1, filtered.length - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusIdx((i) => Math.max(i - 1, 0))
          break
        case "Enter":
          e.preventDefault()
          if (focusIdx >= 0 && focusIdx < filtered.length) {
            selectItem(filtered[focusIdx])
          }
          break
      }
    },
    [close, filtered, focusIdx, selectItem],
  )

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close()
  }

  // SSR guard
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  // Build grouped items
  let lastGroup: string | undefined
  const rows: React.ReactNode[] = []

  filtered.forEach((item, i) => {
    if (item.group && item.group !== lastGroup) {
      lastGroup = item.group
      rows.push(
        <div
          key={`g-${item.group}`}
          className="px-4 pt-1.5 pb-1 text-[0.7rem] uppercase tracking-wider text-muted-foreground"
          data-slot="mn-cp-group"
        >
          {item.group}
        </div>,
      )
    }

    rows.push(
      <div
        key={`i-${i}`}
        data-idx={i}
        role="option"
        aria-selected={i === focusIdx}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground transition-colors",
          i === focusIdx && "bg-muted",
        )}
        onClick={() => selectItem(item)}
        onMouseEnter={() => setFocusIdx(i)}
        data-slot="mn-cp-item"
      >
        {item.icon && (
          <span className="w-[18px] shrink-0 text-center" data-slot="mn-cp-icon">
            {item.icon}
          </span>
        )}
        <span className="flex-1" data-slot="mn-cp-text">
          {item.text}
        </span>
        {item.shortcut && (
          <span className="font-mono text-xs text-muted-foreground/70" data-slot="mn-cp-shortcut">
            {item.shortcut}
          </span>
        )}
      </div>,
    )
  })

  return createPortal(
    <div
      className={backdropVariants({ visible: open })}
      onClick={handleBackdropClick}
      data-slot="mn-command-palette-backdrop"
    >
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex max-h-[60vh] w-[520px] max-w-[90vw] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl",
          className,
        )}
        data-slot="mn-command-palette"
      >
        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground"
          data-slot="mn-cp-input"
        />

        {/* Results list */}
        <div
          ref={listRef}
          role="listbox"
          className="flex-1 overflow-y-auto py-2"
          data-slot="mn-cp-list"
        >
          {rows.length > 0 ? (
            rows
          ) : (
            <div className="px-4 py-5 text-center text-sm text-muted-foreground">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export { MnCommandPalette, backdropVariants }
