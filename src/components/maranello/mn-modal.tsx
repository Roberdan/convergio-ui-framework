"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Focusable selector
// ---------------------------------------------------------------------------

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const backdropVariants = cva(
  "fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 transition-opacity duration-200",
  {
    variants: {
      visible: {
        true: "opacity-100 pointer-events-auto",
        false: "opacity-0 pointer-events-none",
      },
    },
    defaultVariants: { visible: false },
  },
)

const modalVariants = cva(
  "relative flex max-h-[85vh] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl",
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        default: "w-full max-w-lg",
        lg: "w-full max-w-2xl",
        xl: "w-full max-w-4xl",
        full: "w-[90vw] max-w-[90vw]",
      },
    },
    defaultVariants: { size: "default" },
  },
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MnModalProps
  extends VariantProps<typeof modalVariants> {
  /** Whether the modal is open. */
  open: boolean
  /** Called when the modal requests to close. */
  onOpenChange: (open: boolean) => void
  /** Modal title rendered in the header. */
  title?: string
  /** Close on backdrop click. @default true */
  closeOnBackdropClick?: boolean
  /** Close on Escape key press. @default true */
  closeOnEscape?: boolean
  /** id applied to the title element for aria-labelledby. */
  titleId?: string
  /** id applied to the body element for aria-describedby. */
  bodyId?: string
  className?: string
  children?: React.ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function MnModal({
  open,
  onOpenChange,
  title,
  size,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  titleId: titleIdProp,
  bodyId: bodyIdProp,
  className,
  children,
}: MnModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  const fallbackTitleId = React.useId()
  const fallbackBodyId = React.useId()
  const titleId = titleIdProp ?? fallbackTitleId
  const bodyId = bodyIdProp ?? fallbackBodyId

  // Save & restore focus on open/close
  React.useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      // Focus first focusable element inside the modal
      requestAnimationFrame(() => {
        const el = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE)
        el?.focus()
      })
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  // Escape key handler
  React.useEffect(() => {
    if (!open || !closeOnEscape) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onOpenChange(false)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, closeOnEscape, onOpenChange])

  // Focus trap (Tab / Shift+Tab)
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const modal = modalRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  // Lock body scroll
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  // SSR guard: only portal when mounted
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <div
      className={backdropVariants({ visible: open })}
      onClick={handleBackdropClick}
      data-slot="mn-modal-backdrop"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={bodyId}
        className={cn(modalVariants({ size }), className)}
        data-slot="mn-modal"
      >
        {/* Header */}
        {title && (
          <div
            className="flex items-center justify-between border-b border-border px-5 py-4"
            data-slot="mn-modal-header"
          >
            <span
              id={titleId}
              className="text-lg font-semibold text-foreground"
              data-slot="mn-modal-title"
            >
              {title}
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              &#x2715;
            </button>
          </div>
        )}

        {/* Body */}
        <div
          id={bodyId}
          className="flex-1 overflow-y-auto px-5 py-5 text-muted-foreground"
          data-slot="mn-modal-body"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export { MnModal, modalVariants, backdropVariants }
