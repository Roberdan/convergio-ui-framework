"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  label: string
  href?: string
  id?: string
  current?: boolean
}

export interface MnBreadcrumbProps
  extends React.ComponentProps<"nav">,
    VariantProps<typeof breadcrumbVariants> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  onNavigate?: (
    item: BreadcrumbItem,
    index: number,
    event: React.MouseEvent,
  ) => void
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const breadcrumbVariants = cva("flex flex-wrap items-center gap-1.5 text-sm", {
  variants: {
    size: {
      default: "text-sm",
      sm: "text-xs gap-1",
      lg: "text-base gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const breadcrumbItemVariants = cva(
  "inline-flex items-center transition-colors",
  {
    variants: {
      active: {
        true: "font-medium text-foreground pointer-events-none",
        false:
          "text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BreadcrumbSeparator({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      data-slot="breadcrumb-separator"
      className={cn("text-muted-foreground/60 select-none", className)}
    >
      {children ?? "›"}
    </li>
  )
}

function BreadcrumbNode({
  item,
  index,
  isLast,
  onNavigate,
}: {
  item: BreadcrumbItem
  index: number
  isLast: boolean
  onNavigate?: MnBreadcrumbProps["onNavigate"]
}) {
  const isActive = item.current || isLast
  const sharedProps = {
    "data-slot": "breadcrumb-item",
    className: cn(breadcrumbItemVariants({ active: isActive })),
    ...(isActive ? { "aria-current": "page" as const } : {}),
  }

  const handleClick = onNavigate
    ? (e: React.MouseEvent) => onNavigate(item, index, e)
    : undefined

  return (
    <li data-slot="breadcrumb-node">
      {item.href && !isActive ? (
        <a href={item.href} onClick={handleClick} {...sharedProps}>
          {item.label}
        </a>
      ) : (
        <span onClick={handleClick} {...sharedProps}>
          {item.label}
        </span>
      )}
    </li>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function MnBreadcrumb({
  items,
  separator,
  size,
  onNavigate,
  className,
  ...props
}: MnBreadcrumbProps) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" data-slot="mn-breadcrumb" {...props}>
      <ol className={cn(breadcrumbVariants({ size, className }))}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <React.Fragment key={item.id ?? index}>
              <BreadcrumbNode
                item={item}
                index={index}
                isLast={isLast}
                onNavigate={onNavigate}
              />
              {!isLast && (
                <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

export {
  MnBreadcrumb,
  BreadcrumbSeparator,
  BreadcrumbNode,
  breadcrumbVariants,
  breadcrumbItemVariants,
}
