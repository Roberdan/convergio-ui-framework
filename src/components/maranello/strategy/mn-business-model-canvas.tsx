"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import {
  Users, Zap, Package, Heart, MessageSquare, Truck, Target,
  DollarSign, TrendingUp, Plus, X,
} from "lucide-react"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BmcBlockId =
  | "keyPartners" | "keyActivities" | "keyResources"
  | "valuePropositions" | "customerRelationships" | "channels"
  | "customerSegments" | "costStructure" | "revenueStreams"

export interface BmcItem { id?: string; text: string }

export interface BmcBlock {
  id: BmcBlockId; label: string; items: BmcItem[]; icon?: React.ReactNode
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const BLOCK_ICON: Record<BmcBlockId, React.ReactNode> = {
  keyPartners: <Users className="h-4 w-4" />,
  keyActivities: <Zap className="h-4 w-4" />,
  keyResources: <Package className="h-4 w-4" />,
  valuePropositions: <Heart className="h-4 w-4" />,
  customerRelationships: <MessageSquare className="h-4 w-4" />,
  channels: <Truck className="h-4 w-4" />,
  customerSegments: <Target className="h-4 w-4" />,
  costStructure: <DollarSign className="h-4 w-4" />,
  revenueStreams: <TrendingUp className="h-4 w-4" />,
}

const BLOCK_LABEL: Record<BmcBlockId, string> = {
  keyPartners: "Key Partners",
  keyActivities: "Key Activities",
  keyResources: "Key Resources",
  valuePropositions: "Value Propositions",
  customerRelationships: "Customer Relationships",
  channels: "Channels",
  customerSegments: "Customer Segments",
  costStructure: "Cost Structure",
  revenueStreams: "Revenue Streams",
}

const GRID_AREA: Record<BmcBlockId, string> = {
  keyPartners: "kp", keyActivities: "ka", keyResources: "kr",
  valuePropositions: "vp", customerRelationships: "cr", channels: "ch",
  customerSegments: "cs", costStructure: "co", revenueStreams: "rs",
}

const BLOCK_IDS: BmcBlockId[] = [
  "keyPartners", "keyActivities", "keyResources", "valuePropositions",
  "customerRelationships", "channels", "customerSegments",
  "costStructure", "revenueStreams",
]

// ---------------------------------------------------------------------------
// CVA
// ---------------------------------------------------------------------------

const blockVariants = cva(
  "flex flex-col rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 min-h-[140px]",
)

const itemVariants = cva(
  "group flex items-center justify-between gap-2 rounded-md border border-[var(--mn-border)] bg-[var(--mn-surface-raised,var(--mn-surface))] px-2.5 py-1.5 text-sm text-[var(--mn-text)] shadow-sm",
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let counter = 0
function uid(): string { return `bmc-${++counter}-${Date.now().toString(36)}` }

function defaultBlocks(): BmcBlock[] {
  return BLOCK_IDS.map((id) => ({
    id, label: BLOCK_LABEL[id], icon: BLOCK_ICON[id], items: [],
  }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface MnBusinessModelCanvasProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  blocks?: BmcBlock[]
  editable?: boolean
  onChange?: (blocks: BmcBlock[]) => void
}

function MnBusinessModelCanvasBlock({
  block, editable, onAdd, onRemove,
}: {
  block: BmcBlock; editable: boolean
  onAdd: (blockId: BmcBlockId, text: string) => void
  onRemove: (blockId: BmcBlockId, idx: number) => void
}) {
  const [adding, setAdding] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const headerId = `bmc-hdr-${block.id}`

  function commit() {
    const t = draft.trim()
    if (t) onAdd(block.id, t)
    setDraft(""); setAdding(false)
  }

  React.useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  return (
    <div
      role="region"
      aria-labelledby={headerId}
      className={cn(blockVariants())}
      style={{ gridArea: GRID_AREA[block.id] }}
    >
      <div id={headerId} className="mb-2 flex items-center gap-1.5">
        <span className="text-[var(--mn-text-muted)]" aria-hidden="true">
          {block.icon ?? BLOCK_ICON[block.id]}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--mn-text-muted)]">
          {block.label}
        </span>
      </div>

      <ul role="list" aria-label={`${block.label} items`} className="flex flex-col gap-1.5 flex-1">
        {block.items.map((item, idx) => (
          <li key={item.id ?? idx} className={itemVariants()}>
            <span className="truncate">{item.text}</span>
            {editable && (
              <button
                type="button"
                aria-label={`Remove ${item.text}`}
                className="shrink-0 rounded p-0.5 text-[var(--mn-text-muted)] opacity-0 transition-opacity hover:text-[var(--mn-error)] group-hover:opacity-100 focus:opacity-100"
                onClick={() => onRemove(block.id, idx)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {editable && !adding && (
        <button
          type="button"
          aria-label={`Add ${block.label.toLowerCase()}`}
          className="mt-2 flex items-center gap-1 self-start rounded px-1.5 py-1 text-xs text-[var(--mn-text-muted)] hover:bg-[var(--mn-muted)] hover:text-[var(--mn-text)] transition-colors"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add
        </button>
      )}

      {editable && adding && (
        <div className="mt-2 flex gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            aria-label={`New ${block.label.toLowerCase()}`}
            className="flex-1 rounded border border-[var(--mn-border)] bg-[var(--mn-surface)] px-2 py-1 text-xs text-[var(--mn-text)] placeholder:text-[var(--mn-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--mn-accent)]"
            placeholder="Enter item…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commit() }
              if (e.key === "Escape") { setDraft(""); setAdding(false) }
            }}
          />
          <button
            type="button"
            aria-label="Confirm"
            className="rounded bg-[var(--mn-accent)] px-2 py-1 text-xs font-medium text-[var(--mn-accent-text,#fff)] hover:opacity-90 transition-opacity"
            onClick={commit}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function MnBusinessModelCanvas({
  blocks: controlledBlocks, editable = true, onChange, className, ...props
}: MnBusinessModelCanvasProps) {
  const blocks = controlledBlocks ?? defaultBlocks()

  function handleAdd(blockId: BmcBlockId, text: string) {
    const next = blocks.map((b) =>
      b.id === blockId
        ? { ...b, items: [...b.items, { id: uid(), text }] }
        : b,
    )
    onChange?.(next)
  }

  function handleRemove(blockId: BmcBlockId, idx: number) {
    const next = blocks.map((b) =>
      b.id === blockId
        ? { ...b, items: b.items.filter((_, i) => i !== idx) }
        : b,
    )
    onChange?.(next)
  }

  return (
    <div
      role="region"
      aria-label="Business Model Canvas"
      className={cn(
        "grid gap-3 [grid-template-areas:'kp_ka_vp_cr_cs''kp_ka_vp_cr_cs''kp_kr_vp_ch_cs''kp_kr_vp_ch_cs''co_co_co_rs_rs'] [grid-template-columns:repeat(5,1fr)] [grid-template-rows:repeat(5,1fr)]",
        className,
      )}
      {...props}
    >
      {blocks.map((block) => (
        <MnBusinessModelCanvasBlock
          key={block.id}
          block={block}
          editable={editable}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      ))}
    </div>
  )
}

export { MnBusinessModelCanvas, blockVariants, itemVariants }
