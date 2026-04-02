import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12

interface Breakpoints {
  sm?: GridColumns
  md?: GridColumns
  lg?: GridColumns
  xl?: GridColumns
}

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const gridVariants = cva("grid", {
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: { gap: "md", align: "stretch" },
})

// ---------------------------------------------------------------------------
// Column maps
// ---------------------------------------------------------------------------

const BASE_COL: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
}

const SM_COL: Record<GridColumns, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
}

const MD_COL: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
}

const LG_COL: Record<GridColumns, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
}

const XL_COL: Record<GridColumns, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
  12: "xl:grid-cols-12",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveColumns(
  columns: GridColumns,
  breakpoints?: Breakpoints,
): string {
  const classes = [BASE_COL[columns]]
  if (breakpoints?.sm) classes.push(SM_COL[breakpoints.sm])
  if (breakpoints?.md) classes.push(MD_COL[breakpoints.md])
  if (breakpoints?.lg) classes.push(LG_COL[breakpoints.lg])
  if (breakpoints?.xl) classes.push(XL_COL[breakpoints.xl])
  return classes.join(" ")
}

// ---------------------------------------------------------------------------
// Grid item
// ---------------------------------------------------------------------------

interface MnGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns this item spans (1-12). */
  span?: number
  /** Override alignment for this item. */
  alignSelf?: "start" | "center" | "end" | "stretch"
}

const SELF_ALIGN: Record<string, string> = {
  start: "self-start",
  center: "self-center",
  end: "self-end",
  stretch: "self-stretch",
}

function MnGridItem({
  span,
  alignSelf,
  className,
  children,
  ...props
}: MnGridItemProps) {
  const colSpan = span
    ? `col-span-${Math.max(1, Math.min(12, span))}`
    : undefined

  return (
    <div
      {...props}
      className={cn(
        colSpan,
        alignSelf && SELF_ALIGN[alignSelf],
        className,
      )}
      style={
        span
          ? { gridColumn: `span ${Math.max(1, Math.min(12, span))} / span ${Math.max(1, Math.min(12, span))}` }
          : undefined
      }
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MnGridLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  /** Base number of columns (used at smallest viewport). */
  columns?: GridColumns
  /** Responsive column overrides per breakpoint. */
  breakpoints?: Breakpoints
  /** Accessible label for the grid region. */
  "aria-label"?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Responsive CSS Grid layout with configurable columns, gap, and breakpoints.
 *
 * Use `MnGridItem` as children for explicit span/alignment control.
 */
function MnGridLayout({
  columns = 1,
  breakpoints,
  gap,
  align,
  className,
  children,
  ...props
}: MnGridLayoutProps) {
  return (
    <div
      {...props}
      className={cn(
        gridVariants({ gap, align }),
        resolveColumns(columns, breakpoints),
        className,
      )}
    >
      {children}
    </div>
  )
}

export { MnGridLayout, MnGridItem, gridVariants }
export type { MnGridLayoutProps, MnGridItemProps, GridColumns, Breakpoints }
