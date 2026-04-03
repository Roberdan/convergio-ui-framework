"use client"

import { useCallback, useEffect, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────── */

type ToastVariant = "success" | "error" | "warning" | "info"

interface ToastData {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastOptions {
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
}

/* ── CVA variants ──────────────────────────────────────── */

const toastVariants = cva(
  "pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.4)] min-w-[280px] max-w-[420px] transition-all duration-300",
  {
    variants: {
      variant: {
        success: "border-l-green-500 bg-neutral-900 text-neutral-300",
        error: "border-l-red-500 bg-neutral-900 text-neutral-300",
        warning: "border-l-amber-500 bg-neutral-900 text-neutral-300",
        info: "border-l-sky-500 bg-neutral-900 text-neutral-300",
      },
    },
    defaultVariants: { variant: "info" },
  },
)

type ToastVariantProps = VariantProps<typeof toastVariants>

const icons: Record<ToastVariant, string> = {
  success: "\u2713",
  warning: "\u26A0",
  error: "\u2716",
  info: "\u2139",
}

/* ── Module-level store ────────────────────────────────── */

let nextId = 0
let store: ToastData[] = []
let listeners: Array<(t: ToastData[]) => void> = []

function emit() {
  const snapshot = [...store]
  listeners.forEach((fn) => fn(snapshot))
}

function dismiss(id: string) {
  store = store.filter((t) => t.id !== id)
  emit()
}

/* ── Public toast() trigger ────────────────────────────── */

function toast(opts: ToastOptions): string {
  const id = String(++nextId)
  store = [
    ...store,
    {
      id,
      message: opts.message,
      title: opts.title,
      variant: opts.variant ?? "info",
      duration: opts.duration ?? 5000,
    },
  ]
  emit()
  return id
}

toast.success = (message: string, opts?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ ...opts, message, variant: "success" })
toast.error = (message: string, opts?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ ...opts, message, variant: "error" })
toast.warning = (message: string, opts?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ ...opts, message, variant: "warning" })
toast.info = (message: string, opts?: Omit<ToastOptions, "message" | "variant">) =>
  toast({ ...opts, message, variant: "info" })
toast.dismiss = dismiss

/* ── Hooks ─────────────────────────────────────────────── */

function useToasts() {
  const [state, setState] = useState<ToastData[]>([])
  useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((fn) => fn !== setState)
    }
  }, [])
  return state
}

/* ── Toast item (internal) ─────────────────────────────── */

function ToastItem({
  data,
  onDismiss,
}: {
  data: ToastData
  onDismiss: () => void
}) {
  const [removing, setRemoving] = useState(false)
  const isUrgent = data.variant === "error" || data.variant === "warning"

  const handleDismiss = useCallback(() => {
    setRemoving(true)
    setTimeout(onDismiss, 300)
  }, [onDismiss])

  useEffect(() => {
    if (data.duration <= 0) return
    const timer = setTimeout(handleDismiss, data.duration)
    return () => clearTimeout(timer)
  }, [data.duration, handleDismiss])

  return (
    <div
      role={isUrgent ? "alert" : "status"}
      aria-live={isUrgent ? "assertive" : "polite"}
      className={cn(
        toastVariants({ variant: data.variant }),
        removing && "translate-x-full opacity-0",
      )}
    >
      <span className="mt-0.5 shrink-0 text-lg" aria-hidden="true">
        {icons[data.variant]}
      </span>
      <div className="min-w-0 flex-1">
        {data.title && (
          <div className="mb-0.5 text-sm font-semibold text-neutral-100">
            {data.title}
          </div>
        )}
        <div className="text-sm leading-snug">{data.message}</div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 cursor-pointer rounded px-1.5 py-0.5 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )
}

/* ── MnToast container (mount once in layout) ──────────── */

function MnToast({ className }: { className?: string }) {
  const items = useToasts()

  if (items.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-end gap-2 px-4",
        className,
      )}
    >
      {items.map((t) => (
        <ToastItem key={t.id} data={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

export { MnToast, toast, toastVariants, type ToastVariantProps, type ToastOptions }
