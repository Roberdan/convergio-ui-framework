"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral"

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const mnBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-tight",
  {
    variants: {
      tone: {
        success:
          "bg-[var(--mn-success-bg)] text-[var(--mn-success)] border border-[color-mix(in_srgb,var(--mn-success)_24%,transparent)]",
        warning:
          "bg-[var(--mn-warning-bg)] text-[var(--mn-warning)] border border-[color-mix(in_srgb,var(--mn-warning)_24%,transparent)]",
        danger:
          "bg-[var(--mn-error-bg)] text-[var(--mn-error)] border border-[color-mix(in_srgb,var(--mn-error)_24%,transparent)]",
        info:
          "bg-[var(--mn-info-bg)] text-[var(--mn-info)] border border-[color-mix(in_srgb,var(--mn-info)_24%,transparent)]",
        neutral:
          "bg-muted text-muted-foreground border border-border",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
)

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MnBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof mnBadgeVariants> {
  /** The text displayed inside the badge. Falls back to `children`. */
  label?: string
  /** Semantic tone controlling colors. */
  tone?: BadgeTone
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `MnBadge` renders a small status label.
 *
 * Supports five semantic tones (`success`, `warning`, `danger`, `info`,
 * `neutral`) that automatically adapt to the active Maranello theme.
 */
export function MnBadge({
  label,
  tone = "neutral",
  className,
  children,
  role,
  ...props
}: MnBadgeProps) {
  const content = label ?? children

  return (
    <span
      role={role ?? "status"}
      {...props}
      className={cn(mnBadgeVariants({ tone }), className)}
    >
      {content}
    </span>
  )
}

export { mnBadgeVariants }
