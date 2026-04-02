"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Filter, X, ChevronDown, ChevronUp, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterOption { id: string; label: string; count?: number }
export interface RangeConfig { min: number; max: number; step?: number }
export type FilterSectionType = "checkbox" | "radio" | "range"
export interface FilterSection {
  id: string; label: string; type?: FilterSectionType
  options?: FilterOption[]; range?: RangeConfig
  defaultCollapsed?: boolean; searchable?: boolean
}
export type ActiveFilters = Record<string, string[] | [number, number]>

const filterPanelVariants = cva(
  "flex flex-col bg-background text-foreground border border-border rounded-lg",
  { variants: { size: { default: "w-72", wide: "w-96", compact: "w-60", full: "w-full" } },
    defaultVariants: { size: "default" } },
)

export interface MnFilterPanelProps
  extends React.ComponentProps<"div">, VariantProps<typeof filterPanelVariants> {
  sections: FilterSection[]; filters?: ActiveFilters
  onFilterChange?: (filters: ActiveFilters) => void
  onApply?: (filters: ActiveFilters) => void
  clearAllLabel?: string; applyLabel?: string
}

interface SectionBlockProps {
  section: FilterSection; value: string[] | [number, number] | undefined
  onUpdate: (sectionId: string, value: string[] | [number, number]) => void
  onClear: (sectionId: string) => void
}

function FilterSectionBlock({ section, value, onUpdate, onClear }: SectionBlockProps) {
  const [collapsed, setCollapsed] = React.useState(section.defaultCollapsed ?? false)
  const [query, setQuery] = React.useState("")
  const type = section.type ?? "checkbox"
  const selected = type !== "range" ? ((value as string[] | undefined) ?? []) : []
  const Chevron = collapsed ? ChevronDown : ChevronUp
  const filteredOptions = React.useMemo(() => {
    if (!section.options) return []
    if (!query) return section.options
    const q = query.toLowerCase()
    return section.options.filter((o) => o.label.toLowerCase().includes(q))
  }, [section.options, query])
  const handleToggle = (optId: string) => {
    if (type === "radio") { onUpdate(section.id, selected.includes(optId) ? [] : [optId]); return }
    const next = selected.includes(optId) ? selected.filter((id) => id !== optId) : [...selected, optId]
    onUpdate(section.id, next)
  }
  const handleRange = (idx: 0 | 1, val: number) => {
    const r = section.range!
    const cur = (value as [number, number] | undefined) ?? [r.min, r.max]
    const next: [number, number] = [cur[0], cur[1]]
    next[idx] = val
    if (idx === 0 && next[0] > next[1]) next[1] = next[0]
    if (idx === 1 && next[1] < next[0]) next[0] = next[1]
    onUpdate(section.id, next)
  }
  const hasActive = type === "range" ? value !== undefined : selected.length > 0

  return (
    <div data-slot="mn-filter-section" className="border-b border-border last:border-b-0">
      <button type="button" data-slot="mn-filter-section-header" aria-expanded={!collapsed}
        className={cn(
          "flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground cursor-pointer",
          "hover:bg-muted/50 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
        onClick={() => setCollapsed((c) => !c)}>
        <span className="truncate">{section.label}</span>
        <span className="flex items-center gap-1.5">
          {hasActive && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              {type === "range" ? 1 : selected.length}
            </span>
          )}
          <Chevron className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </span>
      </button>
      {!collapsed && (
        <div data-slot="mn-filter-section-body" role="group" aria-label={section.label}
          className="px-3 pb-2.5 flex flex-col gap-1">
          {section.searchable && type !== "range" && (
            <div className="relative mb-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" aria-hidden="true" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search\u2026" aria-label={`Search ${section.label}`}
                className={cn(
                  "w-full rounded-md border border-border bg-background pl-7 pr-2 py-1.5 text-sm",
                  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )} />
            </div>
          )}
          {type !== "range" && filteredOptions.map((opt) => {
            const checked = selected.includes(opt.id)
            return (
              <label key={opt.id} className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm",
                "hover:bg-muted/50 transition-colors", checked && "bg-muted/60",
              )}>
                <input type={type === "radio" ? "radio" : "checkbox"} name={`mn-filter-${section.id}`}
                  value={opt.id} checked={checked} onChange={() => handleToggle(opt.id)}
                  className="accent-[var(--mn-accent)] size-3.5 shrink-0" />
                <span className="flex-1 truncate text-foreground">{opt.label}</span>
                {opt.count !== undefined && (
                  <span className="text-xs text-muted-foreground tabular-nums">{opt.count}</span>
                )}
              </label>
            )
          })}
          {type === "range" && section.range && (() => {
            const r = section.range!
            const cur = (value as [number, number] | undefined) ?? [r.min, r.max]
            return (
              <div className="flex flex-col gap-2 px-1">
                <input type="range" min={r.min} max={r.max} step={r.step ?? 1} value={cur[0]}
                  aria-label={`${section.label} minimum`}
                  onChange={(e) => handleRange(0, Number(e.target.value))}
                  className="w-full accent-[var(--mn-accent)]" />
                <input type="range" min={r.min} max={r.max} step={r.step ?? 1} value={cur[1]}
                  aria-label={`${section.label} maximum`}
                  onChange={(e) => handleRange(1, Number(e.target.value))}
                  className="w-full accent-[var(--mn-accent)]" />
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                  <span>{cur[0]}</span><span>{cur[1]}</span>
                </div>
              </div>
            )
          })()}
          {hasActive && (
            <button type="button" onClick={() => onClear(section.id)}
              className="mt-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors self-start">
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function MnFilterPanel({
  sections, filters: controlledFilters, onFilterChange, onApply,
  clearAllLabel = "Clear all", applyLabel = "Apply filters",
  size, className, ...props
}: MnFilterPanelProps) {
  const [internal, setInternal] = React.useState<ActiveFilters>({})
  const isControlled = controlledFilters !== undefined
  const filters = isControlled ? controlledFilters : internal
  const commit = React.useCallback((next: ActiveFilters) => {
    if (!isControlled) setInternal(next)
    onFilterChange?.(next)
  }, [isControlled, onFilterChange])
  const updateSection = React.useCallback((id: string, val: string[] | [number, number]) => {
    const next = { ...filters }
    if (Array.isArray(val) && val.length === 0) delete next[id]; else next[id] = val
    commit(next)
  }, [filters, commit])
  const clearSection = React.useCallback((id: string) => {
    const next = { ...filters }; delete next[id]; commit(next)
  }, [filters, commit])
  const clearAll = React.useCallback(() => commit({}), [commit])
  const chips = React.useMemo(() => {
    const out: { sectionId: string; label: string; optionId?: string }[] = []
    for (const s of sections) {
      const val = filters[s.id]
      if (!val) continue
      if (s.type === "range") {
        const [lo, hi] = val as [number, number]
        out.push({ sectionId: s.id, label: `${s.label}: ${lo}\u2013${hi}` })
      } else {
        for (const id of val as string[]) {
          const opt = s.options?.find((o) => o.id === id)
          if (opt) out.push({ sectionId: s.id, optionId: id, label: opt.label })
        }
      }
    }
    return out
  }, [sections, filters])
  const removeChip = React.useCallback((sectionId: string, optionId?: string) => {
    if (!optionId) { clearSection(sectionId); return }
    const current = (filters[sectionId] as string[] | undefined) ?? []
    updateSection(sectionId, current.filter((id) => id !== optionId))
  }, [filters, clearSection, updateSection])

  return (
    <div data-slot="mn-filter-panel" className={cn(filterPanelVariants({ size }), className)} {...props}>
      <div data-slot="mn-filter-panel-header"
        className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Filter className="size-4" aria-hidden="true" />
          Filters
          {chips.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              {chips.length}
            </span>
          )}
        </span>
        {chips.length > 0 && (
          <button type="button" onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            {clearAllLabel}
          </button>
        )}
      </div>
      {chips.length > 0 && (
        <div data-slot="mn-filter-panel-chips"
          className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-border">
          {chips.map((chip) => (
            <span key={`${chip.sectionId}-${chip.optionId ?? "range"}`}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground">
              {chip.label}
              <button type="button" aria-label={`Remove ${chip.label}`}
                onClick={() => removeChip(chip.sectionId, chip.optionId)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors cursor-pointer">
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div data-slot="mn-filter-panel-body" className="flex-1 min-h-0 overflow-y-auto">
        {sections.map((s) => (
          <FilterSectionBlock key={s.id} section={s}
            value={filters[s.id]} onUpdate={updateSection} onClear={clearSection} />
        ))}
      </div>
      {onApply && (
        <div data-slot="mn-filter-panel-footer" className="px-3 py-2.5 border-t border-border">
          <button type="button" onClick={() => onApply(filters)}
            className={cn(
              "w-full rounded-md py-2 text-sm font-medium transition-colors cursor-pointer",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}>
            {applyLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export { filterPanelVariants }
