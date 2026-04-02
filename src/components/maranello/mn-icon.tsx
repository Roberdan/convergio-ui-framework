import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { mnIconCatalog, type MnIconName, type MnIconEntry } from "./mn-icon-catalog"

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const mnIconVariants = cva("inline-flex shrink-0", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MnIconProps
  extends Omit<
      React.SVGProps<SVGSVGElement>,
      "children" | "dangerouslySetInnerHTML"
    >,
    VariantProps<typeof mnIconVariants> {
  /** Icon name from the catalog. */
  name: MnIconName
  /** Accessible label. When provided the icon is meaningful; otherwise it is decorative (`aria-hidden`). */
  label?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `MnIcon` renders a 24×24 stroke-based SVG icon from the Maranello catalog.
 *
 * Icons inherit `currentColor` from the parent, making them theme-agnostic.
 *
 * @example
 * ```tsx
 * <MnIcon name="search" size="lg" />
 * <MnIcon name="checkCircle" label="Success" className="text-green-600" />
 * ```
 */
export function MnIcon({
  name,
  size,
  label,
  className,
  ...props
}: MnIconProps) {
  const entry: MnIconEntry | undefined =
    mnIconCatalog[name as keyof typeof mnIconCatalog]

  if (!entry) return null

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={entry.sw ?? 1.5}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn(mnIconVariants({ size }), className)}
      {...props}
      dangerouslySetInnerHTML={{ __html: entry.d }}
    />
  )
}

export { mnIconVariants, mnIconCatalog, type MnIconName, type MnIconEntry }
