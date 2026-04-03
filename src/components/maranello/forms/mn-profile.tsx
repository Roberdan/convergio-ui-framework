"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Variants ── */

const profileVariants = cva("relative inline-block font-[var(--font-body)]", {
  variants: { size: { sm: "text-sm", default: "text-sm", lg: "text-base" } },
  defaultVariants: { size: "default" },
})

const menuVariants = cva(
  "absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-[var(--radius-lg)] border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] shadow-[var(--shadow-deep)] transition-all duration-150",
  {
    variants: {
      open: { true: "scale-100 opacity-100", false: "pointer-events-none scale-95 opacity-0" },
    },
    defaultVariants: { open: false },
  },
)

/* ── Types ── */

export interface ProfileSectionItem {
  label: string; icon?: React.ReactNode; href?: string
  onClick?: () => void; danger?: boolean; badge?: number | string
}
export interface ProfileSection { title?: string; items: ProfileSectionItem[] }

export interface MnProfileProps extends VariantProps<typeof profileVariants> {
  name: string; email?: string; avatarUrl?: string
  sections?: ProfileSection[]; trigger?: React.ReactNode; className?: string
}

/* ── Helpers ── */

function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? "?") + (p.length > 1 ? p[p.length - 1]![0] : "")).toUpperCase()
}

const fmtBadge = (v: number | string) => typeof v === "string" ? v : v > 99 ? "99+" : String(v)

const avatarBase = "inline-flex items-center justify-center rounded-full border-2 border-[var(--mn-border)] bg-[linear-gradient(135deg,var(--mn-surface-raised),var(--mn-surface-sunken))] font-semibold uppercase text-[var(--mn-text-muted)] overflow-hidden select-none font-[var(--font-display)]"

/* ── Component ── */

function MnProfile({ name, email, avatarUrl, sections = [], trigger, size, className }: MnProfileProps) {
  const [open, setOpen] = React.useState(false)
  const [imgErr, setImgErr] = React.useState(false)
  const [focusIdx, setFocusIdx] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const itemsRef = React.useRef<HTMLElement[]>([])

  React.useEffect(() => setImgErr(false), [avatarUrl])

  const allItems = React.useMemo(() => sections.flatMap((s) => s.items), [sections])

  React.useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setFocusIdx(-1) } }
    document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h)
  }, [open])

  React.useEffect(() => { if (focusIdx >= 0) itemsRef.current[focusIdx]?.focus() }, [focusIdx])

  const handleItemKey = (e: React.KeyboardEvent, idx: number) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setFocusIdx((idx + 1) % allItems.length); break
      case "ArrowUp": e.preventDefault(); setFocusIdx((idx - 1 + allItems.length) % allItems.length); break
      case "Home": e.preventDefault(); setFocusIdx(0); break
      case "End": e.preventDefault(); setFocusIdx(allItems.length - 1); break
      case "Enter": case " ": e.preventDefault(); allItems[idx]?.onClick?.(); if (!allItems[idx]?.href) setOpen(false); break
      case "Tab": setOpen(false); setFocusIdx(-1); break
    }
  }

  const showImg = avatarUrl && !imgErr
  const initials = getInitials(name)

  const renderAvatar = (sz: "size-9 text-xs" | "size-14 text-sm") => (
    <span className={cn(avatarBase, sz)}>
      {showImg ? (
        <img src={avatarUrl} alt="" aria-hidden="true" className="size-full object-cover" onError={() => setImgErr(true)} />
      ) : <span aria-hidden="true">{initials}</span>}
    </span>
  )

  let flatIdx = -1

  return (
    <div ref={containerRef} data-slot="mn-profile" className={cn(profileVariants({ size }), className)}>
      <button
        type="button" aria-haspopup="true" aria-expanded={open}
        onClick={() => { setOpen((o) => !o); setFocusIdx(-1) }}
        onKeyDown={(e) => { if (["ArrowDown", "Enter", " "].includes(e.key)) { e.preventDefault(); setOpen(true); setFocusIdx(0) } }}
        className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]"
      >
        {trigger ?? renderAvatar("size-9 text-xs")}
      </button>

      <div role="menu" aria-label="Profile menu" className={menuVariants({ open })}>
        <div className="flex items-center gap-3 border-b border-[var(--mn-border)] p-4">
          {renderAvatar("size-14 text-sm")}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-[var(--mn-text)] font-[var(--font-display)]">{name}</div>
            {email && <div className="truncate text-xs text-[var(--mn-text-muted)]">{email}</div>}
          </div>
        </div>
        {sections.map((section, si) => (
          <div key={si} className="py-1">
            {section.title && (
              <div className="px-4 py-1.5 text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--mn-text-tertiary)]">{section.title}</div>
            )}
            {section.items.map((item) => {
              flatIdx++
              const idx = flatIdx
              const Tag = item.href ? "a" : "button"
              const extra = item.href ? { href: item.href } : { type: "button" as const, onClick: () => { item.onClick?.(); setOpen(false) } }
              return (
                <Tag key={idx} role="menuitem" tabIndex={focusIdx === idx ? 0 : -1}
                  ref={(el: HTMLElement | null) => { if (el) itemsRef.current[idx] = el }}
                  onKeyDown={(e: React.KeyboardEvent) => handleItemKey(e, idx)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left text-[var(--mn-text)]",
                    "transition-colors hover:bg-[var(--mn-hover-bg)] focus-visible:outline-none focus-visible:bg-[var(--mn-hover-bg)]",
                    item.danger && "text-[var(--mn-error)]",
                  )} {...extra}>
                  {item.icon && <span className="flex size-5 shrink-0 items-center justify-center text-[var(--mn-text-muted)]">{item.icon}</span>}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge != null && (
                    <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--mn-accent)] px-1.5 py-0.5 text-[0.625rem] font-bold text-[var(--mn-accent-text,var(--mn-text-inverse))]">{fmtBadge(item.badge)}</span>
                  )}
                </Tag>
              )
            })}
            {si < sections.length - 1 && <div className="my-1 border-t border-[var(--mn-border)]" role="separator" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export { MnProfile, profileVariants, menuVariants }