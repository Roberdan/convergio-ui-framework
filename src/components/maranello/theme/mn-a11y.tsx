"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "mn-a11y"

type FontSize = "sm" | "md" | "lg" | "xl"
interface A11ySettings {
  fontSize: FontSize
  reducedMotion: boolean
  highContrast: boolean
  focusVisible: boolean
}

const DEFAULTS: A11ySettings = { fontSize: "md", reducedMotion: false, highContrast: false, focusVisible: true }
const SIZES: Record<FontSize, number> = { sm: 0.875, md: 1.0, lg: 1.125, xl: 1.25 }
const FONT_KEYS = Object.keys(SIZES) as FontSize[]

function setClassState(target: Element, className: string, enabled: boolean) {
  if (enabled) target.classList.add(className)
  else target.classList.remove(className)
}

const sizeButtonVariants = cva(
  "cursor-pointer rounded-md border px-3 py-1.5 text-xs transition-all duration-150",
  {
    variants: {
      active: {
        true: "border-[var(--mn-error)] bg-[var(--mn-error)] text-[var(--mn-text)]",
        false: "border-[var(--mn-border)] bg-transparent text-[var(--mn-text-tertiary)] hover:bg-[var(--mn-border)]",
      },
    },
    defaultVariants: { active: false },
  },
)

function loadSettings(): A11ySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch { return { ...DEFAULTS } }
}

function applySettings(s: A11ySettings) {
  const root = document.documentElement
  root.style.fontSize = `${(SIZES[s.fontSize] ?? 1) * 16}px`
  setClassState(root, "mn-reduced-motion", s.reducedMotion)
  setClassState(root, "mn-high-contrast", s.highContrast)
  setClassState(root, "mn-no-focus-ring", !s.focusVisible)
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* noop */ }
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-[var(--mn-text-tertiary)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-[22px] w-10 cursor-pointer rounded-full border-none p-0 transition-colors duration-150",
          checked ? "bg-[var(--mn-error)]" : "bg-[var(--mn-border)]",
        )}
      >
        <span className={cn(
          "absolute top-0.5 h-[18px] w-[18px] rounded-full bg-[var(--mn-text)] transition-[left] duration-150",
          checked ? "left-5" : "left-0.5",
        )} />
      </button>
    </div>
  )
}

export type MnA11yProps = React.HTMLAttributes<HTMLDivElement>

/** Accessibility FAB with settings panel. Persists to localStorage. */
export function MnA11y({ className, ...props }: MnA11yProps) {
  const [open, setOpen] = React.useState(false)
  const [settings, setSettings] = React.useState<A11ySettings>(DEFAULTS)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const fabRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => { const s = loadSettings(); setSettings(s); applySettings(s) }, [])

  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    applySettings(settings)
  }, [settings])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) { setOpen(false); fabRef.current?.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (panelRef.current && !panelRef.current.contains(t) && fabRef.current && !fabRef.current.contains(t))
        setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const update = (patch: Partial<A11ySettings>) => setSettings((p) => ({ ...p, ...patch }))

  return (
    <div {...props} className={cn("fixed bottom-6 right-6 z-[8500]", className)}>
      <button
        ref={fabRef}
        aria-label="Display settings"
        aria-expanded={open}
        aria-controls="mn-a11y-panel"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full",
          "border-2 border-white/20 bg-[var(--mn-error)] text-white shadow-[0_4px_16px_rgba(220,0,0,.45),0_2px_8px_rgba(0,0,0,.4)]",
          "transition-all duration-200 hover:scale-[1.07] hover:bg-[var(--mn-error-dark,#b00000)] hover:shadow-[0_6px_20px_rgba(220,0,0,.55),0_3px_10px_rgba(0,0,0,.4)]",
          "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--mn-accent)]",
        )}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
          <rect x="2" y="4" width="18" height="2" rx="1" />
          <rect x="2" y="10" width="18" height="2" rx="1" />
          <rect x="2" y="16" width="18" height="2" rx="1" />
          <circle cx="7" cy="5" r="3" /><circle cx="15" cy="11" r="3" /><circle cx="9" cy="17" r="3" />
        </svg>
      </button>

      <div
        ref={panelRef}
        id="mn-a11y-panel"
        role="dialog"
        aria-label="Accessibility settings"
        aria-modal="true"
        className={cn(
          "absolute bottom-16 right-0 w-[280px] rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] p-4 font-[var(--font-body,sans-serif)] text-[var(--mn-text-tertiary)] shadow-[0_12px_32px_rgba(0,0,0,.5)]",
          "transition-all duration-200",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <div className="mb-3.5 flex items-center gap-1.5 text-[0.95rem] font-semibold text-[var(--mn-text)]">
          ⚙ Display
        </div>
        <div className="mb-3">
          <div className="mb-1.5 text-xs uppercase tracking-wider text-[var(--mn-text-muted)]">Text Size</div>
          <div className="flex gap-1">
            {FONT_KEYS.map((k) => (
              <button type="button" key={k} onClick={() => update({ fontSize: k })}
                className={sizeButtonVariants({ active: settings.fontSize === k })}>
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <hr className="my-2.5 border-[var(--mn-border)]" />
        <ToggleRow label="Reduced Motion" checked={settings.reducedMotion}
          onChange={() => update({ reducedMotion: !settings.reducedMotion })} />
        <ToggleRow label="High Contrast" checked={settings.highContrast}
          onChange={() => update({ highContrast: !settings.highContrast })} />
        <ToggleRow label="Focus Indicators" checked={settings.focusVisible}
          onChange={() => update({ focusVisible: !settings.focusVisible })} />
        <hr className="my-2.5 border-[var(--mn-border)]" />
        <button type="button" onClick={() => setSettings({ ...DEFAULTS })}
          className="mt-2 w-full cursor-pointer rounded-md border border-[var(--mn-border)] bg-transparent px-2 py-2 text-xs text-[var(--mn-text-tertiary)] transition-colors duration-150 hover:bg-[var(--mn-border)]">
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
