"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const panelVariants = cva(
  "fixed top-0 right-0 z-[9001] flex h-full flex-col border-l bg-background shadow-2xl transition-transform duration-300 ease-in-out",
  {
    variants: {
      size: {
        default: "w-full max-w-md", sm: "w-full max-w-sm",
        lg: "w-full max-w-xl", xl: "w-full max-w-2xl",
      },
    },
    defaultVariants: { size: "default" },
  },
)

const backdropVariants = cva(
  "fixed inset-0 z-[9000] bg-black/50 transition-opacity duration-200",
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

export type DetailFieldType = "text" | "number" | "date" | "select" | "boolean" | "readonly"
export interface DetailFieldOption { value: string; label: string }
export interface DetailField {
  key: string; label: string; type?: DetailFieldType
  value?: string | number | boolean | null
  options?: DetailFieldOption[]; required?: boolean; readOnly?: boolean
}
export interface DetailSection { title?: string; fields: DetailField[] }

export interface MnDetailPanelProps extends VariantProps<typeof panelVariants> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  sections: DetailSection[]
  defaultEditing?: boolean
  editable?: boolean
  onSave?: (data: Record<string, unknown>) => void
  className?: string
  children?: React.ReactNode
}

const INPUT_CLS = "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
const VAL_CLS = "text-sm text-foreground"

function FieldView({ field }: { field: DetailField }) {
  const v = field.value
  if (v == null || v === "") return <span className="text-muted-foreground italic text-sm">—</span>
  if (field.type === "boolean") return <span className={VAL_CLS}>{v ? "Yes" : "No"}</span>
  if (field.type === "select" && field.options) {
    const opt = field.options.find((o) => o.value === String(v))
    return <span className={VAL_CLS}>{opt?.label ?? String(v)}</span>
  }
  return <span className={VAL_CLS}>{String(v)}</span>
}

function FieldEditor({ field, value, onChange }: { field: DetailField; value: unknown; onChange: (k: string, v: unknown) => void }) {
  if (field.readOnly || field.type === "readonly") return <FieldView field={{ ...field, value: value as string }} />
  const set = (v: unknown) => onChange(field.key, v)
  switch (field.type) {
    case "boolean":
      return (
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} className="size-4 rounded border-border accent-[var(--mn-primary)]" />
          {value ? "Yes" : "No"}
        </label>
      )
    case "select":
      return (
        <select value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={INPUT_CLS}>
          <option value="">Select…</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    case "number":
      return <input type="number" value={value != null ? String(value) : ""} onChange={(e) => set(e.target.value === "" ? null : Number(e.target.value))} className={INPUT_CLS} />
    case "date":
      return <input type="date" value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={INPUT_CLS} />
    default:
      return <input type="text" value={String(value ?? "")} onChange={(e) => set(e.target.value)} className={INPUT_CLS} />
  }
}

function MnDetailPanel({ open, onOpenChange, title, sections, size, defaultEditing = false, editable = true, onSave, className, children }: MnDetailPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [editing, setEditing] = React.useState(defaultEditing)
  const [changes, setChanges] = React.useState<Record<string, unknown>>({})

  React.useEffect(() => { if (!open) { setEditing(defaultEditing); setChanges({}) } }, [open, defaultEditing])

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

  const handleFieldChange = (key: string, val: unknown) => setChanges((p) => ({ ...p, [key]: val }))

  const handleSave = () => {
    const payload: Record<string, unknown> = {}
    for (const s of sections) for (const f of s.fields) payload[f.key] = changes[f.key] !== undefined ? changes[f.key] : f.value
    onSave?.(payload); setEditing(false); setChanges({})
  }

  const handleCancel = () => { setEditing(false); setChanges({}) }

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <>
      <div className={backdropVariants({ visible: open })} onClick={() => onOpenChange(false)} aria-hidden="true" data-slot="mn-detail-panel-backdrop" />
      <div ref={panelRef} role="complementary" aria-label={title} className={cn(panelVariants({ size }), open ? "translate-x-0" : "translate-x-full", className)} data-slot="mn-detail-panel">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4" data-slot="mn-detail-panel-header">
          <h2 className="truncate text-lg font-semibold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            {editable && !editing && (
              <button type="button" onClick={() => setEditing(true)} className="rounded-md px-3 py-1 text-sm font-medium text-[var(--mn-primary)] transition-colors hover:bg-[var(--mn-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Edit</button>
            )}
            {editing && (
              <>
                <button type="button" onClick={handleCancel} className="rounded-md px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted">Cancel</button>
                <button type="button" onClick={handleSave} className="rounded-md bg-[var(--mn-primary)] px-3 py-1 text-sm font-medium text-[var(--mn-primary-foreground)] transition-colors hover:opacity-90">Save</button>
              </>
            )}
            <button type="button" aria-label="Close" onClick={() => onOpenChange(false)} className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">&#x2715;</button>
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5" data-slot="mn-detail-panel-body">
          {sections.map((section, si) => (
            <div key={si} className={cn(si > 0 && "mt-6")}>
              {section.title && <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3>}
              <div className="grid gap-4">
                {section.fields.map((field) => {
                  const cur = changes[field.key] !== undefined ? changes[field.key] : field.value
                  return (
                    <div key={field.key} className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">{field.label}{field.required && <span className="ml-0.5 text-destructive">*</span>}</span>
                      {editing && !field.readOnly && field.type !== "readonly" ? <FieldEditor field={field} value={cur} onChange={handleFieldChange} /> : <FieldView field={field} />}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {children}
        </div>
      </div>
    </>,
    document.body,
  )
}

export { MnDetailPanel, panelVariants, backdropVariants }
