"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Bell, X, CheckCircle } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Variants                                                          */
/* ------------------------------------------------------------------ */

const panelVariants = cva(
  "fixed top-0 z-[9001] flex h-full w-full max-w-sm flex-col border-l bg-background shadow-2xl transition-transform duration-300 ease-in-out",
  {
    variants: {
      position: { right: "right-0", left: "left-0 border-l-0 border-r" },
    },
    defaultVariants: { position: "right" },
  },
)

const backdropVariants = cva(
  "fixed inset-0 z-[9000] bg-black/50 transition-opacity duration-200",
  {
    variants: {
      visible: { true: "opacity-100 pointer-events-auto", false: "opacity-0 pointer-events-none" },
    },
    defaultVariants: { visible: false },
  },
)

const dotVariants = cva("mt-1.5 size-2 shrink-0 rounded-full", {
  variants: {
    type: { info: "bg-blue-500", success: "bg-emerald-500", warning: "bg-amber-500", error: "bg-destructive" },
  },
  defaultVariants: { type: "info" },
})

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface MnNotification {
  id: string
  title: string
  body?: string
  type?: "info" | "success" | "warning" | "error"
  read?: boolean
  timestamp?: string
  action?: { label: string; onClick: () => void }
}

export interface MnNotificationCenterProps extends VariantProps<typeof panelVariants> {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: MnNotification[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onRemove?: (id: string) => void
  onClear?: () => void
  loading?: boolean
  className?: string
}

/* ------------------------------------------------------------------ */
/*  NotificationItem                                                  */
/* ------------------------------------------------------------------ */

function NotificationItem({ notification, onMarkRead, onRemove }: {
  notification: MnNotification; onMarkRead?: (id: string) => void; onRemove?: (id: string) => void
}) {
  const type = notification.type ?? "info"
  return (
    <div
      className={cn(
        "group flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-muted/50",
        !notification.read && "cursor-pointer bg-muted/30",
      )}
      onClick={() => !notification.read && onMarkRead?.(notification.id)}
      role="article"
    >
      <span className={dotVariants({ type })} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm text-foreground", !notification.read && "font-semibold")}>{notification.title}</p>
        {notification.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>}
        <div className="mt-1 flex items-center gap-2">
          {notification.timestamp && <span className="text-xs text-muted-foreground">{notification.timestamp}</span>}
          {notification.action && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); notification.action?.onClick() }}
              className="text-xs font-medium text-[var(--mn-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label={`Remove ${notification.title}`}
        onClick={(e) => { e.stopPropagation(); onRemove?.(notification.id) }}
        className="shrink-0 self-start rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MnNotificationCenter                                              */
/* ------------------------------------------------------------------ */

function MnNotificationCenter({
  open, onOpenChange, notifications, onMarkRead, onMarkAllRead,
  onRemove, onClear, loading, position, className,
}: MnNotificationCenterProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter((n) => !n.read).length

  React.useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onOpenChange(false) } }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [open, onOpenChange])

  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  React.useEffect(() => {
    if (!open || !panelRef.current) return
    const panel = panelRef.current
    const getFocusable = () =>
      panel.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
    getFocusable()[0]?.focus()
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const els = getFocusable()
      if (!els.length) return
      if (e.shiftKey && document.activeElement === els[0]) { e.preventDefault(); els[els.length - 1].focus() }
      else if (!e.shiftKey && document.activeElement === els[els.length - 1]) { e.preventDefault(); els[0].focus() }
    }
    panel.addEventListener("keydown", h)
    return () => panel.removeEventListener("keydown", h)
  }, [open])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const translateCls = position === "left"
    ? (open ? "translate-x-0" : "-translate-x-full")
    : (open ? "translate-x-0" : "translate-x-full")

  return createPortal(
    <>
      <div className={backdropVariants({ visible: open })} onClick={() => onOpenChange(false)} aria-hidden="true" data-slot="mn-notification-center-backdrop" />
      <div ref={panelRef} role="dialog" aria-label="Notifications" aria-live="polite"
        className={cn(panelVariants({ position }), translateCls, className)} data-slot="mn-notification-center">
        <div className="flex items-center justify-between border-b border-border px-4 py-3" data-slot="mn-notification-center-header">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                aria-label={`${unreadCount} unread`}>{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && onMarkAllRead && (
              <button type="button" onClick={onMarkAllRead} aria-label="Mark all as read"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <CheckCircle className="size-4" />
              </button>
            )}
            {notifications.length > 0 && onClear && (
              <button type="button" onClick={onClear} aria-label="Clear all notifications"
                className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Clear
              </button>
            )}
            <button type="button" aria-label="Close notifications" onClick={() => onOpenChange(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" data-slot="mn-notification-center-body">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" role="status" aria-label="Loading" />
              <span className="text-sm">Loading notifications…</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Bell className="size-10 opacity-30" />
              <span className="text-sm">No notifications</span>
            </div>
          ) : (
            notifications.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} onRemove={onRemove} />)
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}

export { MnNotificationCenter, panelVariants, backdropVariants, dotVariants }
