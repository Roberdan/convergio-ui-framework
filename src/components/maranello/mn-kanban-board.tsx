"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KanbanColumn { id: string; title: string; color?: string }

export interface KanbanCard {
  id: string; columnId: string; title: string; description?: string
  assignee?: string; tags?: string[]; priority?: "low" | "medium" | "high" | "critical"
}

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const columnVariants = cva(
  "flex flex-col min-w-[280px] max-w-[320px] rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] shrink-0",
)

const cardVariants = cva(
  "rounded-md border border-[var(--mn-border)] bg-[var(--mn-surface-raised,var(--mn-surface))] p-3 shadow-sm cursor-grab select-none transition-shadow",
  {
    variants: {
      priority: {
        low: "border-l-2 border-l-[var(--mn-info)]",
        medium: "border-l-2 border-l-[var(--mn-warning)]",
        high: "border-l-2 border-l-[var(--mn-error)]",
        critical: "border-l-2 border-l-[var(--mn-error)] ring-1 ring-[var(--mn-error)]",
      },
    },
  },
)

export interface MnKanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: KanbanColumn[]; cards: KanbanCard[]
  onCardMove?: (cardId: string, fromCol: string, toCol: string, position: number) => void
  onCardClick?: (card: KanbanCard) => void; onAddCard?: (columnId: string) => void
}

function MnKanbanBoard({
  columns, cards, onCardMove, onCardClick, onAddCard, className, ...props
}: MnKanbanBoardProps) {
  const [dragCardId, setDragCardId] = React.useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = React.useState<string | null>(null)
  const [grabbedCardId, setGrabbedCardId] = React.useState<string | null>(null)
  const sourceColRef = React.useRef<string>("")

  function handleDragStart(e: React.DragEvent, card: KanbanCard) {
    setDragCardId(card.id); sourceColRef.current = card.columnId
    e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", card.id)
  }
  function handleDragEnd() { setDragCardId(null); setDragOverCol(null) }
  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverCol(colId)
  }
  function handleDragLeave(e: React.DragEvent, colId: string) {
    const related = e.relatedTarget as HTMLElement | null
    if (related && (e.currentTarget as HTMLElement).contains(related)) return
    if (dragOverCol === colId) setDragOverCol(null)
  }
  function handleDrop(e: React.DragEvent, colId: string) {
    e.preventDefault()
    const cardId = e.dataTransfer.getData("text/plain")
    if (cardId) onCardMove?.(cardId, sourceColRef.current, colId, cards.filter((c) => c.columnId === colId).length)
    setDragCardId(null); setDragOverCol(null)
  }

  function handleCardKeyDown(e: React.KeyboardEvent, card: KanbanCard) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); setGrabbedCardId((prev) => (prev === card.id ? null : card.id)); return
    }
    if (e.key === "Escape" && grabbedCardId) { e.preventDefault(); setGrabbedCardId(null); return }
    if (grabbedCardId !== card.id) return
    const colIdx = columns.findIndex((c) => c.id === card.columnId)
    if (colIdx === -1) return
    if (e.key === "ArrowLeft" && colIdx > 0) {
      e.preventDefault(); const to = columns[colIdx - 1]
      onCardMove?.(card.id, card.columnId, to.id, cards.filter((c) => c.columnId === to.id).length)
      setGrabbedCardId(null)
    } else if (e.key === "ArrowRight" && colIdx < columns.length - 1) {
      e.preventDefault(); const to = columns[colIdx + 1]
      onCardMove?.(card.id, card.columnId, to.id, cards.filter((c) => c.columnId === to.id).length)
      setGrabbedCardId(null)
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); const cc = cards.filter((c) => c.columnId === card.columnId)
      const idx = cc.findIndex((c) => c.id === card.id)
      if (idx > 0) onCardMove?.(card.id, card.columnId, card.columnId, idx - 1)
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); const cc = cards.filter((c) => c.columnId === card.columnId)
      const idx = cc.findIndex((c) => c.id === card.id)
      if (idx < cc.length - 1) onCardMove?.(card.id, card.columnId, card.columnId, idx + 1)
    }
  }

  return (
    <div
      role="region"
      aria-label="Kanban board"
      className={cn("flex gap-4 overflow-x-auto p-4", className)}
      {...props}
    >
      {columns.map((col) => {
        const colCards = cards.filter((c) => c.columnId === col.id)
        const isOver = dragOverCol === col.id

        return (
          <div key={col.id} className={columnVariants()}>
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--mn-border)]">
              <div className="flex items-center gap-2">
                {col.color && (
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                )}
                <span className="text-sm font-semibold text-[var(--mn-text)]">
                  {col.title}
                </span>
              </div>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--mn-surface-raised,var(--mn-muted))] px-1.5 text-xs font-medium text-[var(--mn-text-muted)]">
                {colCards.length}
              </span>
            </div>

            {/* Drop zone */}
            <div
              role="listbox"
              aria-label={col.title}
              className={cn(
                "flex flex-1 flex-col gap-2 p-2 min-h-[120px] transition-colors",
                isOver && "bg-[var(--mn-accent-bg,var(--mn-info-bg))] rounded-b-lg",
              )}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {colCards.map((card) => (
                <div
                  key={card.id}
                  role="option"
                  tabIndex={0}
                  draggable
                  aria-grabbed={grabbedCardId === card.id}
                  aria-selected={grabbedCardId === card.id}
                  data-card-id={card.id}
                  className={cn(
                    cardVariants({ priority: card.priority }),
                    dragCardId === card.id && "opacity-50",
                    grabbedCardId === card.id && "ring-2 ring-[var(--mn-accent)]",
                  )}
                  onDragStart={(e) => handleDragStart(e, card)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onCardClick?.(card)}
                  onKeyDown={(e) => handleCardKeyDown(e, card)}
                >
                  <div className="text-sm font-medium text-[var(--mn-text)]">
                    {card.title}
                  </div>
                  {card.description && (
                    <div className="mt-1 text-xs text-[var(--mn-text-muted)] line-clamp-2">
                      {card.description}
                    </div>
                  )}
                  {(card.assignee || (card.tags && card.tags.length > 0)) && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {card.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full bg-[var(--mn-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--mn-text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                      {card.assignee && (
                        <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mn-accent-bg,var(--mn-info-bg))] text-[10px] font-semibold text-[var(--mn-accent,var(--mn-info))]">
                          {card.assignee.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add card action */}
            {onAddCard && (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 border-t border-[var(--mn-border)] px-3 py-2 text-xs font-medium text-[var(--mn-text-muted)] hover:bg-[var(--mn-muted)] hover:text-[var(--mn-text)] transition-colors rounded-b-lg"
                onClick={() => onAddCard(col.id)}
              >
                <span aria-hidden="true">+</span> Add card
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { MnKanbanBoard, columnVariants, cardVariants }
