"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ChevronDown, ToggleLeft, ToggleRight, Info } from "lucide-react"

/* ── Variants ── */

const panelVariants = cva("flex flex-col gap-6 font-[var(--font-body)]", {
  variants: {
    size: {
      sm: "text-sm max-w-sm",
      default: "text-sm max-w-lg",
      lg: "text-base max-w-2xl",
    },
  },
  defaultVariants: { size: "default" },
})

const sectionVariants = cva(
  "rounded-[var(--radius-md)] border border-[var(--mn-border)] bg-[var(--mn-surface-raised)]",
)

/* ── Types ── */

interface ToggleItem {
  type: "toggle"
  label: string
  description?: string
  value: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}

interface SelectItem {
  type: "select"
  label: string
  description?: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}

interface TextItem {
  type: "text"
  label: string
  description?: string
  value: string
  placeholder?: string
  maxLength?: number
  onChange: (v: string) => void
}

interface InfoItem {
  type: "info"
  label: string
  value: string
  mono?: boolean
}

export type SettingsItemType = ToggleItem | SelectItem | TextItem | InfoItem

export interface SettingsSection {
  id?: string
  title: string
  description?: string
  items: SettingsItemType[]
}

export interface MnSettingsPanelProps extends VariantProps<typeof panelVariants> {
  sections: SettingsSection[]
  className?: string
}

/* ── Item renderers ── */

function SettingsToggle({ item }: { item: ToggleItem }) {
  const id = React.useId()
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-[var(--mn-text)] cursor-pointer">{item.label}</label>
        {item.description && <p className="mt-0.5 text-xs text-[var(--mn-text-muted)]">{item.description}</p>}
      </div>
      <button
        id={id} type="button" role="switch" aria-checked={item.value}
        disabled={item.disabled}
        onClick={() => item.onChange(!item.value)}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-label={item.label}
      >
        {item.value
          ? <ToggleRight className="size-7 text-[var(--mn-accent)]" aria-hidden="true" />
          : <ToggleLeft className="size-7 text-[var(--mn-text-muted)]" aria-hidden="true" />}
      </button>
    </div>
  )
}

function SettingsSelect({ item }: { item: SelectItem }) {
  const id = React.useId()
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-[var(--mn-text)]">{item.label}</label>
        {item.description && <p className="mt-0.5 text-xs text-[var(--mn-text-muted)]">{item.description}</p>}
      </div>
      <div className="relative">
        <select
          id={id} value={item.value} onChange={(e) => item.onChange(e.target.value)}
          className={cn(
            "appearance-none rounded-[var(--radius-md)] border border-[var(--mn-border)]",
            "bg-[var(--mn-surface-raised)] py-1.5 pl-3 pr-8 text-sm text-[var(--mn-text)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
          )}
        >
          {item.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-[var(--mn-text-muted)]" aria-hidden="true" />
      </div>
    </div>
  )
}

function SettingsText({ item }: { item: TextItem }) {
  const id = React.useId()
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-[var(--mn-text)]">{item.label}</label>
        {item.description && <p className="mt-0.5 text-xs text-[var(--mn-text-muted)]">{item.description}</p>}
      </div>
      <input
        id={id} type="text" value={item.value}
        placeholder={item.placeholder} maxLength={item.maxLength}
        onChange={(e) => item.onChange(e.target.value)}
        className={cn(
          "w-48 rounded-[var(--radius-md)] border border-[var(--mn-border)]",
          "bg-[var(--mn-surface-raised)] px-3 py-1.5 text-sm text-[var(--mn-text)]",
          "placeholder:text-[var(--mn-text-muted)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
        )}
      />
    </div>
  )
}

function SettingsInfo({ item }: { item: InfoItem }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-2">
        <Info className="size-4 text-[var(--mn-text-muted)]" aria-hidden="true" />
        <span className="text-sm font-medium text-[var(--mn-text)]">{item.label}</span>
      </div>
      <span className={cn("text-sm text-[var(--mn-text-muted)]", item.mono && "font-mono")}>{item.value}</span>
    </div>
  )
}

function SettingsItem({ item }: { item: SettingsItemType }) {
  switch (item.type) {
    case "toggle": return <SettingsToggle item={item} />
    case "select": return <SettingsSelect item={item} />
    case "text": return <SettingsText item={item} />
    case "info": return <SettingsInfo item={item} />
  }
}

/* ── Component ── */

function MnSettingsPanel({ sections, size, className }: MnSettingsPanelProps) {
  return (
    <div data-slot="mn-settings-panel" className={cn(panelVariants({ size }), className)}>
      {sections.map((section, si) => (
        <fieldset key={section.id ?? si} className={sectionVariants()} data-section-id={section.id}>
          <legend className="ml-4 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--mn-text-muted)]">
            {section.title}
          </legend>
          {section.description && (
            <p className="px-4 pb-1 text-xs text-[var(--mn-text-muted)]">{section.description}</p>
          )}
          <div className="divide-y divide-[var(--mn-border)]">
            {section.items.map((item, ii) => (
              <SettingsItem key={`${section.id ?? si}-${item.label}-${ii}`} item={item} />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

export { MnSettingsPanel, panelVariants, sectionVariants }
