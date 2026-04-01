"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionNavItem {
  /** Unique identifier for the section. */
  id: string
  /** Human-readable label. Falls back to `id` if omitted. */
  label?: string
}

export type SectionNavPosition = "top" | "bottom"

export interface MnSectionNavProps extends Omit<React.ComponentProps<"nav">, "children"> {
  /** Ordered list of navigable sections. */
  items: SectionNavItem[]
  /** The `id` of the currently active section. */
  current: string
  /** Controls which edge gets the accent border. */
  position?: SectionNavPosition
  /** Called when the user navigates to a different section. */
  onNavigate?: (id: string) => void
}

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const navBarVariants = cva(
  [
    "flex items-center justify-between w-full h-[52px] px-8",
    "bg-[var(--mn-surface)]/[0.98] backdrop-blur-sm",
    "font-[var(--mn-font-display,var(--font-display,'Space_Grotesk',sans-serif))]",
    "text-[0.72rem] uppercase tracking-[0.1em] font-medium",
    "shadow-[0_2px_12px_rgba(0,0,0,0.15)]",
    "transition-colors duration-150",
  ].join(" "),
  {
    variants: {
      position: {
        top: "border-b-2 border-b-[var(--mn-accent)]/50 border-t border-t-[var(--mn-border)]",
        bottom: "border-t-2 border-t-[var(--mn-accent)]/50 border-b-0",
        none: "border-y border-[var(--mn-border)]",
      },
    },
    defaultVariants: { position: "none" },
  },
)

const navBtnVariants = cva(
  [
    "flex items-center gap-2 flex-1 min-w-0",
    "bg-transparent border-none cursor-pointer",
    "text-[var(--mn-text-secondary)] font-inherit text-inherit",
    "tracking-inherit uppercase font-medium",
    "py-2 transition-colors duration-150",
    "hover:text-[var(--mn-accent)]",
    "focus-visible:outline-2 focus-visible:outline-[var(--mn-accent)] focus-visible:outline-offset-[3px] focus-visible:rounded-sm",
    "disabled:opacity-0 disabled:pointer-events-none",
  ].join(" "),
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `MnSectionNav` provides prev/next navigation between ordered page sections.
 *
 * Displays the current position (e.g. "3 / 8 · Dashboard") with accessible
 * previous and next buttons. Keyboard accessible with full focus management.
 */
export function MnSectionNav({
  items,
  current,
  position,
  onNavigate,
  className,
  ...props
}: MnSectionNavProps) {
  const idx = items.findIndex((item) => item.id === current)
  const prev = idx > 0 ? items[idx - 1] : null
  const next = idx < items.length - 1 ? items[idx + 1] : null
  const currentItem = idx >= 0 ? items[idx] : null
  const positionVariant = position ?? "none"

  const handlePrev = React.useCallback(() => {
    if (prev) onNavigate?.(prev.id)
  }, [prev, onNavigate])

  const handleNext = React.useCallback(() => {
    if (next) onNavigate?.(next.id)
  }, [next, onNavigate])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prev) {
        e.preventDefault()
        onNavigate?.(prev.id)
      } else if (e.key === "ArrowRight" && next) {
        e.preventDefault()
        onNavigate?.(next.id)
      }
    },
    [prev, next, onNavigate],
  )

  const label = (item: SectionNavItem) => item.label ?? item.id

  return (
    <nav
      role="navigation"
      aria-label={props["aria-label"] ?? "Section navigation"}
      className={cn(navBarVariants({ position: positionVariant }), className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Previous button */}
      <button
        type="button"
        className={cn(navBtnVariants(), "justify-start")}
        disabled={!prev}
        aria-hidden={!prev ? "true" : undefined}
        aria-label={prev ? `Previous: ${label(prev)}` : undefined}
        onClick={handlePrev}
      >
        <span className="flex-shrink-0 text-[0.8rem] text-[var(--mn-accent)] transition-colors duration-150" aria-hidden="true">
          ◀
        </span>
        {prev && (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] max-sm:max-w-[90px]">
            {label(prev)}
          </span>
        )}
      </button>

      {/* Center indicator */}
      <div
        className={cn(
          "flex-none text-center whitespace-nowrap px-2 leading-none select-none",
          "text-[var(--mn-text-secondary)] text-[0.68rem]",
          "max-[400px]:hidden",
          "max-sm:text-[0.58rem] max-sm:px-1",
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="text-[var(--mn-accent)] font-bold text-[0.85rem]">{idx + 1}</span>
        <span className="opacity-35 mx-[0.3em]">/</span>
        <span>{items.length}</span>
        <span className="opacity-35 mx-[0.3em]">·</span>
        <span className="text-[var(--mn-text)]/80">{currentItem ? label(currentItem) : ""}</span>
      </div>

      {/* Next button */}
      <button
        type="button"
        className={cn(navBtnVariants(), "justify-end")}
        disabled={!next}
        aria-hidden={!next ? "true" : undefined}
        aria-label={next ? `Next: ${label(next)}` : undefined}
        onClick={handleNext}
      >
        {next && (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] max-sm:max-w-[90px]">
            {label(next)}
          </span>
        )}
        <span className="flex-shrink-0 text-[0.8rem] text-[var(--mn-accent)] transition-colors duration-150" aria-hidden="true">
          ▶
        </span>
      </button>
    </nav>
  )
}

export { navBarVariants, navBtnVariants }
