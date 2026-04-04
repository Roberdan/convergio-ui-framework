"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3, Brain, DollarSign, FormInput, Home, Layout,
  MessageSquare, Monitor, Moon, Navigation, Network,
  Search, Settings, Shield, Sun, Table, Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme/theme-provider"
import { searchCatalog } from "@/lib/component-catalog"

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
] as const

const CATEGORY_ITEMS = [
  { label: "Agentic AI", href: "/showcase/agentic", icon: Brain },
  { label: "Data Display", href: "/showcase/data-display", icon: Table },
  { label: "Data Viz", href: "/showcase/data-viz", icon: BarChart3 },
  { label: "Feedback", href: "/showcase/feedback", icon: MessageSquare },
  { label: "Financial", href: "/showcase/financial", icon: DollarSign },
  { label: "Forms", href: "/showcase/forms", icon: FormInput },
  { label: "Layout", href: "/showcase/layout", icon: Layout },
  { label: "Navigation", href: "/showcase/navigation", icon: Navigation },
  { label: "Network", href: "/showcase/network", icon: Network },
  { label: "Operations", href: "/showcase/ops", icon: Settings },
  { label: "Strategy", href: "/showcase/strategy", icon: Target },
] as const

const THEME_ITEMS = [
  { label: "Light", value: "light" as const, icon: Sun },
  { label: "Dark", value: "dark" as const, icon: Moon },
  { label: "Navy", value: "navy" as const, icon: Monitor },
  { label: "Colorblind", value: "colorblind" as const, icon: Shield },
] as const

const ITEM_CLS = "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors text-[var(--mn-text)] hover:bg-[var(--mn-hover-bg)]"
const ITEM_ACTIVE_CLS = "bg-[var(--mn-hover-bg)]"
const GROUP_CLS = "px-3 py-1 text-[0.65rem] uppercase tracking-wider text-[var(--mn-text-muted)]"

export function SearchCombobox() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.length >= 2 ? searchCatalog(query).slice(0, 8) : []

  // Build flat list of selectable items for keyboard nav
  const items = results.length > 0
    ? results.map((e) => ({ type: "nav" as const, label: e.name, href: `/showcase/${e.category}#${e.slug}`, desc: e.description }))
    : [
        ...NAV_ITEMS.map((i) => ({ type: "nav" as const, label: i.label, href: i.href, icon: i.icon })),
        ...CATEGORY_ITEMS.map((i) => ({ type: "nav" as const, label: i.label, href: i.href, icon: i.icon })),
        ...THEME_ITEMS.map((i) => ({ type: "theme" as const, label: i.label, value: i.value, icon: i.icon })),
      ]

  // Cmd-K global shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const select = useCallback((item: typeof items[number]) => {
    if (item.type === "theme" && "value" in item) {
      setTheme(item.value)
    } else if ("href" in item) {
      router.push(item.href)
    }
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
  }, [router, setTheme])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, items.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === "Enter" && items[activeIdx]) { e.preventDefault(); select(items[activeIdx]) }
    else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur() }
  }

  // Determine group boundaries for rendering
  const navEnd = results.length > 0 ? 0 : NAV_ITEMS.length
  const catEnd = results.length > 0 ? 0 : navEnd + CATEGORY_ITEMS.length

  return (
    <div ref={rootRef} className="relative w-full max-w-md" role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-controls="search-combobox-listbox" aria-owns="search-combobox-listbox">
      {/* Search input — IS the search bar */}
      <div className="flex h-8 items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-colors">
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-label="Search components, navigate, or switch theme"
          placeholder="Search..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border border-sidebar-border bg-sidebar-accent px-1.5 py-0.5 font-mono text-[11px] font-medium sm:inline-flex">
          ⌘K
        </kbd>
      </div>

      {/* Dropdown — appears below the search bar, same width */}
      {open && (
        <div
          id="search-combobox-listbox"
          role="listbox"
          aria-label="Search results"
          className="absolute top-[calc(100%+4px)] left-0 w-full max-h-80 overflow-y-auto rounded-lg border border-[var(--mn-border)] bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/10 z-50"
        >
          {results.length > 0 ? (
            <>
              <div className={GROUP_CLS}>Components</div>
              {results.map((entry, i) => (
                <div key={entry.slug} role="option" aria-selected={i === activeIdx}
                  className={cn(ITEM_CLS, i === activeIdx && ITEM_ACTIVE_CLS)}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => select(items[i])}>
                  <span className="text-xs font-mono text-muted-foreground w-4">Mn</span>
                  <span>{entry.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">{entry.description}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className={GROUP_CLS}>Navigation</div>
              {NAV_ITEMS.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={item.href} role="option" aria-selected={i === activeIdx}
                    className={cn(ITEM_CLS, i === activeIdx && ITEM_ACTIVE_CLS)}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => select(items[i])}>
                    <Icon className="size-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                )
              })}
              <div className="mx-2 my-1 h-px bg-[var(--mn-border-subtle)]" />
              <div className={GROUP_CLS}>Categories</div>
              {CATEGORY_ITEMS.map((item, ci) => {
                const idx = navEnd + ci
                const Icon = item.icon
                return (
                  <div key={item.href} role="option" aria-selected={idx === activeIdx}
                    className={cn(ITEM_CLS, idx === activeIdx && ITEM_ACTIVE_CLS)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => select(items[idx])}>
                    <Icon className="size-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                )
              })}
              <div className="mx-2 my-1 h-px bg-[var(--mn-border-subtle)]" />
              <div className={GROUP_CLS}>Theme</div>
              {THEME_ITEMS.map((item, ti) => {
                const idx = catEnd + ti
                const Icon = item.icon
                return (
                  <div key={item.value} role="option" aria-selected={idx === activeIdx}
                    className={cn(ITEM_CLS, idx === activeIdx && ITEM_ACTIVE_CLS)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => select(items[idx])}>
                    <Icon className="size-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">No results found.</div>
          )}
        </div>
      )}
    </div>
  )
}
