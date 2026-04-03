"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────── */

export interface HeaderShellAction {
  id: string
  label?: string
  title?: string
  icon?: React.ReactNode
  active?: boolean
  pressed?: boolean
  disabled?: boolean
}

export interface HeaderShellFilterOption { id: string; label: string }
export interface HeaderShellFilterGroup { id: string; label: string; multi?: boolean; options: HeaderShellFilterOption[] }

export type HeaderShellSectionDef =
  | { type: "brand"; label?: string; logo?: React.ReactNode; href?: string }
  | { type: "actions"; role: "pre" | "post"; items: HeaderShellAction[]; presentation?: "segmented" | "cluster" }
  | { type: "search"; placeholder?: string; shortcut?: string; filters?: HeaderShellFilterGroup[] }
  | { type: "spacer" }
  | { type: "divider" }

export interface HeaderShellCallbacks {
  onAction?: (payload: { id: string; role: "pre" | "post" }) => void
  onSearch?: (payload: { query: string }) => void
  onFilter?: (payload: { groupId: string; values: string[] }) => void
}

export interface MnHeaderShellProps extends React.ComponentProps<"nav"> {
  sections?: HeaderShellSectionDef[]
  callbacks?: HeaderShellCallbacks
  brand?: React.ReactNode
  nav?: React.ReactNode
  actions?: React.ReactNode
}

/* ── CVA variants ──────────────────────────────────────── */

const shellVariants = cva(
  [
    "flex items-center w-full gap-2 px-4 h-14",
    "bg-[var(--mn-surface)] text-[var(--mn-text)]",
    "border-b border-[var(--mn-border)]",
    "font-[var(--mn-font-display,var(--font-display,'Space_Grotesk',sans-serif))]",
    "transition-colors duration-150",
  ].join(" "),
)

const actionBtnVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md",
    "text-xs font-medium uppercase tracking-wider",
    "bg-transparent text-[var(--mn-text-secondary)]",
    "transition-colors duration-150 cursor-pointer",
    "hover:text-[var(--mn-accent)] hover:bg-[var(--mn-hover-bg)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)] focus-visible:ring-offset-2",
    "disabled:opacity-40 disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      active: {
        true: "text-[var(--mn-accent)] bg-[var(--mn-hover-bg)] font-semibold",
        false: "",
      },
    },
    defaultVariants: { active: false },
  },
)

/* ── Internal sub-components ────────────────────────────── */

function ShellBrand({ section }: { section: Extract<HeaderShellSectionDef, { type: "brand" }> }) {
  const inner = (
    <>
      {section.logo && (
        <span className="mn-header-shell__brand-logo flex-shrink-0" aria-hidden="true">
          {section.logo}
        </span>
      )}
      {section.label && (
        <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
          {section.label}
        </span>
      )}
    </>
  )
  const cls = "flex items-center gap-2 text-[var(--mn-text)] no-underline"
  return section.href ? (
    <a href={section.href} className={cls}>{inner}</a>
  ) : (
    <span className={cls}>{inner}</span>
  )
}

function ShellActions({
  section,
  activeId,
  onAction,
}: {
  section: Extract<HeaderShellSectionDef, { type: "actions" }>
  activeId: string
  onAction: (id: string, role: "pre" | "post", selectable: boolean) => void
}) {
  const presentation = section.presentation ?? (section.role === "pre" ? "segmented" : "cluster")
  const isSelectable = presentation === "segmented"

  return (
    <div
      className={cn("flex items-center gap-1", presentation === "segmented" && "rounded-lg bg-[var(--mn-hover-bg)]/40 p-0.5")}
      role="group"
      data-presentation={presentation}
    >
      {section.items.map((action) => {
        const isActive = isSelectable ? action.id === activeId : !!action.active
        return (
          <button
            key={action.id}
            type="button"
            className={cn(actionBtnVariants({ active: isActive }))}
            aria-label={action.title || action.label || action.id}
            aria-pressed={action.pressed ? "true" : undefined}
            title={action.title}
            disabled={action.disabled}
            onClick={() => onAction(action.id, section.role, isSelectable)}
          >
            {action.icon && <span className="flex-shrink-0 [&_svg]:size-4" aria-hidden="true">{action.icon}</span>}
            {action.label && <span>{action.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

function ShellSearch({
  section,
  onSearch,
}: {
  section: Extract<HeaderShellSectionDef, { type: "search" }>
  onSearch?: (payload: { query: string }) => void
}) {
  const handleInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => { onSearch?.({ query: e.target.value }) },
    [onSearch],
  )
  return (
    <div className="relative flex items-center flex-1 min-w-0 max-w-md">
      <input
        type="search"
        placeholder={section.placeholder ?? "Search"}
        className={cn(
          "w-full rounded-md border border-[var(--mn-border)] bg-[var(--mn-hover-bg)]/40",
          "px-3 py-1.5 text-sm text-[var(--mn-text)] placeholder:text-[var(--mn-text-secondary)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
          "transition-colors duration-150",
        )}
        onChange={handleInput}
      />
      {section.shortcut && (
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rounded border border-[var(--mn-border)] bg-[var(--mn-surface)] px-1.5 py-0.5 text-[0.65rem] text-[var(--mn-text-secondary)]">
          {section.shortcut}
        </kbd>
      )}
    </div>
  )
}

/* ── Component ─────────────────────────────────────────── */

/**
 * `MnHeaderShell` — responsive application header bar.
 * Driven via `sections` config prop or composed with `brand`/`nav`/`actions` slots.
 */
export function MnHeaderShell({
  sections,
  callbacks,
  brand,
  nav,
  actions,
  className,
  children,
  ...props
}: MnHeaderShellProps) {
  const [activeActionId, setActiveActionId] = React.useState(() => {
    if (!sections) return ""
    for (const s of sections) {
      if (s.type === "actions") {
        const pres = s.presentation ?? (s.role === "pre" ? "segmented" : "cluster")
        if (pres === "segmented") {
          const active = s.items.find((a) => a.active)
          if (active) return active.id
        }
      }
    }
    return ""
  })

  const handleAction = React.useCallback(
    (id: string, role: "pre" | "post", selectable: boolean) => {
      if (selectable) setActiveActionId(id)
      callbacks?.onAction?.({ id, role })
    },
    [callbacks],
  )

  // Slot-based usage (no sections config)
  if (!sections) {
    return (
      <nav role="navigation" aria-label={props["aria-label"] ?? "Header"} className={cn(shellVariants(), className)} {...props}>
        {brand && <div className="flex items-center gap-2 flex-shrink-0">{brand}</div>}
        {nav && <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">{nav}</div>}
        {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-auto">{actions}</div>}
        {children}
      </nav>
    )
  }

  // Config-driven usage
  return (
    <nav role="navigation" aria-label={props["aria-label"] ?? "Header"} className={cn(shellVariants(), className)} {...props}>
      {sections.map((section, i) => {
        switch (section.type) {
          case "brand":
            return <ShellBrand key={`brand-${i}`} section={section} />
          case "spacer":
            return <span key={`spacer-${i}`} className="flex-1" />
          case "divider":
            return <span key={`divider-${i}`} className="w-px h-6 bg-[var(--mn-border)]" aria-hidden="true" />
          case "actions":
            return <ShellActions key={`actions-${i}`} section={section} activeId={activeActionId} onAction={handleAction} />
          case "search":
            return <ShellSearch key={`search-${i}`} section={section} onSearch={callbacks?.onSearch} />
          default:
            return null
        }
      })}
      {children}
    </nav>
  )
}

export { shellVariants, actionBtnVariants }
