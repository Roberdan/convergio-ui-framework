"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ────────────────────────────────────────────────── */

export interface FacetOption { id: string; label: string; count?: number }
export type FacetType = "multi-select" | "single-select"

export interface FacetGroup {
  id: string
  label: string
  type?: FacetType
  options: FacetOption[]
  defaultCollapsed?: boolean
}

export type FacetFilters = Record<string, string[]>

/* ── CVA variants ─────────────────────────────────────────── */

const facetWorkbenchVariants = cva("flex flex-col bg-background text-foreground", {
  variants: { size: { default: "w-64", wide: "w-80", full: "w-full" } },
  defaultVariants: { size: "default" },
})

const facetGroupVariants = cva("border-b border-border last:border-b-0")

/* ── Props ────────────────────────────────────────────────── */

export interface MnFacetWorkbenchProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof facetWorkbenchVariants> {
  groups: FacetGroup[]
  filters?: FacetFilters
  onFilterChange?: (filters: FacetFilters) => void
  clearAllLabel?: string
}

/* ── Subcomponents ────────────────────────────────────────── */

interface FacetGroupSectionProps {
  group: FacetGroup; selected: string[]
  onToggle: (groupId: string, optionId: string) => void
  onClearGroup: (groupId: string) => void
}

function FacetGroupSection({ group, selected, onToggle, onClearGroup }: FacetGroupSectionProps) {
  const [collapsed, setCollapsed] = React.useState(group.defaultCollapsed ?? false)
  const activeCount = selected.length
  const isMulti = (group.type ?? "multi-select") === "multi-select"

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCollapsed((c) => !c) }
    else if (e.key === "Escape") setCollapsed(true)
  }, [])

  return (
    <div data-slot="mn-facet-group" className={cn(facetGroupVariants(), "group/facet")}>
      <button
        type="button"
        data-slot="mn-facet-group-header"
        aria-expanded={!collapsed}
        className={cn(
          "flex w-full items-center justify-between px-3 py-2.5",
          "text-sm font-medium text-foreground cursor-pointer",
          "hover:bg-muted/50 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
        onClick={() => setCollapsed((c) => !c)}
        onKeyDown={handleKeyDown}
      >
        <span className="flex items-center gap-2">
          <svg
            className={cn(
              "size-3.5 text-muted-foreground transition-transform duration-150",
              collapsed ? "-rotate-90" : "rotate-0",
            )}
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
          {group.label}
        </span>
        {activeCount > 0 && (
          <span data-slot="mn-facet-count" className={cn(
            "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5",
            "rounded-full text-xs font-semibold bg-primary text-primary-foreground",
          )}>
            {activeCount}
          </span>
        )}
      </button>

      {!collapsed && (
        <div data-slot="mn-facet-group-body" role="group" aria-label={group.label}
          className="px-3 pb-2.5 flex flex-col gap-1">
          {group.options.map((opt) => {
            const checked = selected.includes(opt.id)
            return (
              <label
                key={opt.id}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer",
                  "text-sm hover:bg-muted/50 transition-colors",
                  checked && "bg-muted/60",
                )}
              >
                <input
                  type={isMulti ? "checkbox" : "radio"}
                  name={`mn-facet-${group.id}`}
                  value={opt.id}
                  checked={checked}
                  onChange={() => onToggle(group.id, opt.id)}
                  className="accent-[var(--mn-accent)] size-3.5 shrink-0"
                />
                <span className="flex-1 truncate text-foreground">{opt.label}</span>
                {opt.count !== undefined && (
                  <span className="text-xs text-muted-foreground tabular-nums">{opt.count}</span>
                )}
              </label>
            )
          })}

          {activeCount > 0 && (
            <button
              type="button"
              className="mt-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors self-start"
              onClick={() => onClearGroup(group.id)}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main component ───────────────────────────────────────── */

export function MnFacetWorkbench({
  groups,
  filters: controlledFilters,
  onFilterChange,
  clearAllLabel = "Clear all",
  size,
  className,
  children,
  ...props
}: MnFacetWorkbenchProps) {
  const [internalFilters, setInternalFilters] = React.useState<FacetFilters>({})

  const isControlled = controlledFilters !== undefined
  const filters = isControlled ? controlledFilters : internalFilters

  const updateFilters = React.useCallback(
    (next: FacetFilters) => {
      if (!isControlled) setInternalFilters(next)
      onFilterChange?.(next)
    },
    [isControlled, onFilterChange],
  )

  const totalActive = React.useMemo(
    () => Object.values(filters).reduce((sum, ids) => sum + ids.length, 0),
    [filters],
  )

  const toggleOption = React.useCallback(
    (groupId: string, optionId: string) => {
      const group = groups.find((g) => g.id === groupId)
      const isMulti = (group?.type ?? "multi-select") === "multi-select"
      const current = filters[groupId] ?? []

      let next: string[]
      if (isMulti) {
        next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
      } else {
        next = current.includes(optionId) ? [] : [optionId]
      }

      const updated = { ...filters, [groupId]: next }
      // Remove empty arrays
      if (next.length === 0) delete updated[groupId]
      updateFilters(updated)
    },
    [filters, groups, updateFilters],
  )

  const clearGroup = React.useCallback(
    (groupId: string) => {
      const updated = { ...filters }
      delete updated[groupId]
      updateFilters(updated)
    },
    [filters, updateFilters],
  )

  const clearAll = React.useCallback(() => {
    updateFilters({})
  }, [updateFilters])

  return (
    <div
      data-slot="mn-facet-workbench"
      className={cn(facetWorkbenchVariants({ size }), className)}
      {...props}
    >
      {totalActive > 0 && (
        <div data-slot="mn-facet-workbench-header"
          className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">
            {totalActive} active {totalActive === 1 ? "filter" : "filters"}
          </span>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            onClick={clearAll}
          >
            {clearAllLabel}
          </button>
        </div>
      )}

      <div data-slot="mn-facet-workbench-body" className="flex-1 min-h-0 overflow-y-auto">
        {groups.map((group) => (
          <FacetGroupSection
            key={group.id}
            group={group}
            selected={filters[group.id] ?? []}
            onToggle={toggleOption}
            onClearGroup={clearGroup}
          />
        ))}
      </div>

      {children}
    </div>
  )
}

export { facetWorkbenchVariants, facetGroupVariants }
