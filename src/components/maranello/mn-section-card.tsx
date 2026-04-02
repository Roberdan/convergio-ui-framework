"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const sectionCardVariants = cva(
  [
    "rounded-[var(--radius-lg,0.75rem)]",
    "border border-[var(--mn-border)]",
    "overflow-hidden",
    "transition-shadow duration-200",
  ],
  {
    variants: {
      variant: {
        default: "bg-[var(--mn-surface-raised)] shadow-sm",
        flat: "bg-transparent shadow-none border-[var(--mn-border-subtle)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

const headerVariants = cva(
  [
    "flex w-full items-center gap-2 text-left",
    "px-4 py-3",
    "font-semibold text-[var(--mn-text)]",
    "transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--mn-accent)]",
  ],
  {
    variants: {
      collapsible: {
        true: "cursor-pointer select-none hover:bg-[var(--mn-hover-bg)]",
        false: "cursor-default",
      },
    },
    defaultVariants: { collapsible: true },
  },
)

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SectionCardAction {
  label: string
  href?: string
  onClick?: () => void
}

interface MnSectionCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title">,
    VariantProps<typeof sectionCardVariants> {
  /** Section title displayed in the header. */
  title: string
  /** Optional action link/button in the header. */
  action?: SectionCardAction
  /** Badge count displayed next to the title. */
  badge?: number
  /** Whether the card body is collapsible. */
  collapsible?: boolean
  /** Controlled open state. */
  defaultOpen?: boolean
  /** Remove body padding. */
  noPadding?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function MnSectionCard({
  title,
  action,
  badge,
  variant,
  collapsible = true,
  defaultOpen = true,
  noPadding = false,
  className,
  children,
  ...props
}: MnSectionCardProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const innerRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()

  // Smooth height animation
  React.useEffect(() => {
    const body = bodyRef.current
    const inner = innerRef.current
    if (!body || !inner || !collapsible) return

    if (open) {
      const h = inner.scrollHeight
      body.style.height = `${h}px`
      const onEnd = () => {
        body.style.height = "auto"
      }
      body.addEventListener("transitionend", onEnd, { once: true })
      return () => body.removeEventListener("transitionend", onEnd)
    } else {
      body.style.height = `${body.scrollHeight}px`
      requestAnimationFrame(() => {
        body.style.height = "0px"
      })
    }
  }, [open, collapsible])

  const handleToggle = () => {
    if (collapsible) setOpen((prev) => !prev)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (collapsible && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      handleToggle()
    }
  }

  const badgeLabel = badge !== undefined ? ` (${badge > 99 ? "99+" : badge})` : ""

  return (
    <section
      {...props}
      role="region"
      aria-labelledby={titleId}
      className={cn(sectionCardVariants({ variant }), className)}
    >
      {/* Header */}
      <div
        id={titleId}
        role={collapsible ? "button" : undefined}
        aria-expanded={collapsible ? open : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={headerVariants({ collapsible })}
      >
        {collapsible && (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[var(--mn-text-muted)] transition-transform duration-200",
              open && "rotate-0",
              !open && "-rotate-90",
            )}
            aria-hidden="true"
          />
        )}

        <span className="flex-1 truncate text-sm">
          {title}
          {badge !== undefined && (
            <span
              className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--mn-accent)] px-1.5 py-0.5 text-[0.625rem] font-bold text-[var(--mn-accent-text)]"
              aria-label={`${badge} items`}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </span>

        {action && (
          <ActionSlot action={action} />
        )}
      </div>

      {/* Body with animated height */}
      <div
        ref={bodyRef}
        className="overflow-hidden transition-[height] duration-200 ease-in-out"
        aria-hidden={collapsible ? !open : undefined}
        style={!collapsible ? undefined : { height: defaultOpen ? "auto" : "0px" }}
      >
        <div ref={innerRef} className={cn(!noPadding && "px-4 pb-4")}>
          {children}
        </div>
      </div>

      {/* sr-only label for badge */}
      {badge !== undefined && (
        <span className="sr-only">{title}{badgeLabel}</span>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Action sub-component
// ---------------------------------------------------------------------------

function ActionSlot({ action }: { action: SectionCardAction }) {
  const sharedClass = cn(
    "ml-auto shrink-0 rounded px-2 py-1 text-xs font-medium",
    "text-[var(--mn-accent)] hover:bg-[var(--mn-accent-bg)]",
    "transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-[var(--mn-accent)]",
  )

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    action.onClick?.()
  }

  if (action.href) {
    return (
      <a
        href={action.href}
        className={sharedClass}
        onClick={(e) => e.stopPropagation()}
      >
        {action.label}
      </a>
    )
  }

  return (
    <button type="button" className={sharedClass} onClick={handleClick}>
      {action.label}
    </button>
  )
}

export { MnSectionCard, sectionCardVariants, headerVariants }
export type { MnSectionCardProps, SectionCardAction }
