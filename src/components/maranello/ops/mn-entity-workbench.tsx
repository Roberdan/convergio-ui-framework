"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ────────────────────────────────────────────────── */
export interface EntityTab { id: string; label: string }
export interface EntityWorkbenchTab extends EntityTab { dirty?: boolean }

/* ── CVA variants ─────────────────────────────────────────── */

const workbenchVariants = cva("flex flex-col h-full bg-background text-foreground", {
  variants: { size: { default: "min-h-0", full: "h-screen" } },
  defaultVariants: { size: "default" },
})

const tabItemVariants = cva(
  [
    "group relative flex items-center gap-1.5 border-b-2 -mb-[2px] px-3 py-2",
    "text-sm transition-colors duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
  ],
  {
    variants: {
      active: {
        true: "border-b-primary text-foreground font-semibold",
        false: "border-transparent text-muted-foreground hover:text-foreground/70",
      },
    },
    defaultVariants: { active: false },
  },
)

/* ── Props ────────────────────────────────────────────────── */

export interface MnEntityWorkbenchProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof workbenchVariants> {
  tabs: EntityWorkbenchTab[]
  activeTabId?: string
  onTabSelect?: (tabId: string) => void
  onTabClose?: (tabId: string) => void
  onTabAdd?: () => void
  onSave?: (tabId: string) => void
  onReorder?: (tabIds: string[]) => void
  allowAdd?: boolean
  renderContent?: (tab: EntityWorkbenchTab) => React.ReactNode
}

/* ── Component ────────────────────────────────────────────── */

export function MnEntityWorkbench({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabAdd,
  onSave,
  onReorder,
  allowAdd = true,
  renderContent,
  size,
  className,
  children,
  ...props
}: MnEntityWorkbenchProps) {
  const [internalActive, setInternalActive] = React.useState(tabs[0]?.id ?? "")
  const dragRef = React.useRef<string | null>(null)

  const active = activeTabId ?? internalActive
  const currentTab = tabs.find((t) => t.id === active)

  const selectTab = React.useCallback(
    (id: string) => {
      if (activeTabId === undefined) setInternalActive(id)
      onTabSelect?.(id)
    },
    [activeTabId, onTabSelect],
  )

  const closeTab = React.useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      onTabClose?.(id)
      // Auto-select neighbour when closing active tab
      if (id === active && tabs.length > 1) {
        const idx = tabs.findIndex((t) => t.id === id)
        const next = tabs[idx === tabs.length - 1 ? idx - 1 : idx + 1]
        if (next) selectTab(next.id)
      }
    },
    [active, tabs, onTabClose, selectTab],
  )

  const handleDragStart = React.useCallback((id: string) => {
    dragRef.current = id
  }, [])

  const handleDrop = React.useCallback(
    (targetId: string) => {
      const fromId = dragRef.current
      dragRef.current = null
      if (!fromId || fromId === targetId || !onReorder) return

      const ids = tabs.map((t) => t.id)
      const fromIdx = ids.indexOf(fromId)
      const toIdx = ids.indexOf(targetId)
      if (fromIdx === -1 || toIdx === -1) return

      const reordered = [...ids]
      reordered.splice(fromIdx, 1)
      reordered.splice(toIdx, 0, fromId)
      onReorder(reordered)
    },
    [tabs, onReorder],
  )

  const handleTabKeyDown = React.useCallback(
    (e: React.KeyboardEvent, tabId: string) => {
      const idx = tabs.findIndex((t) => t.id === tabId)
      if (e.key === "ArrowRight" && idx < tabs.length - 1) {
        e.preventDefault()
        selectTab(tabs[idx + 1].id)
      } else if (e.key === "ArrowLeft" && idx > 0) {
        e.preventDefault()
        selectTab(tabs[idx - 1].id)
      } else if (e.key === "Delete" || (e.key === "w" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        onTabClose?.(tabId)
      }
    },
    [tabs, selectTab, onTabClose],
  )

  return (
    <div
      data-slot="mn-entity-workbench"
      className={cn(workbenchVariants({ size }), className)}
      {...props}
    >
      <div data-slot="mn-entity-workbench-tabbar" role="tablist"
        className="flex items-end gap-0 border-b-2 border-border bg-muted/30 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tab"
            tabIndex={tab.id === active ? 0 : -1}
            aria-selected={tab.id === active}
            aria-controls={`mn-ew-panel-${tab.id}`}
            className={cn(tabItemVariants({ active: tab.id === active }))}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
            draggable={!!onReorder}
            onDragStart={() => handleDragStart(tab.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(tab.id)}
          >
            {tab.dirty && (
              <span
                data-slot="mn-entity-workbench-dirty"
                className="size-1.5 rounded-full bg-[var(--mn-warning)] shrink-0"
                aria-label="Unsaved changes"
              />
            )}
            <span className="truncate max-w-[140px]">{tab.label}</span>
            {onTabClose && (
              <button
                type="button"
                aria-label={`Close ${tab.label}`}
                className={cn(
                  "ml-1 size-4 shrink-0 rounded-sm inline-flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 focus:opacity-100",
                  "hover:bg-muted text-muted-foreground hover:text-foreground",
                  "transition-opacity duration-100",
                )}
                onClick={(e) => closeTab(e, tab.id)}
                tabIndex={-1}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {allowAdd && onTabAdd && (
          <button
            type="button"
            data-slot="mn-entity-workbench-add"
            aria-label="New tab"
            className={cn(
              "px-2.5 py-2 text-muted-foreground hover:text-foreground",
              "text-sm transition-colors cursor-pointer",
            )}
            onClick={onTabAdd}
          >
            +
          </button>
        )}
      </div>

      <div data-slot="mn-entity-workbench-body" className="flex-1 min-h-0 overflow-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`mn-ew-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`mn-ew-tab-${tab.id}`}
            className={cn(
              "h-full",
              tab.id === active ? "block" : "hidden",
            )}
          >
            {renderContent ? renderContent(tab) : null}
          </div>
        ))}
        {!tabs.length && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No entities open
          </div>
        )}
      </div>

      {currentTab && onSave && (
        <div
          data-slot="mn-entity-workbench-actions"
          className="flex items-center justify-end gap-2 px-4 py-2 border-t border-border bg-muted/20"
        >
          <button
            type="button"
            disabled={!currentTab.dirty}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              currentTab.dirty
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
            onClick={() => onSave(currentTab.id)}
          >
            Save
          </button>
        </div>
      )}

      {children}
    </div>
  )
}

export { workbenchVariants, tabItemVariants }
