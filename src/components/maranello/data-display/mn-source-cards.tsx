'use client'

import { useState, useMemo, useCallback } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { ExternalLink, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type SourceCard,
  type SourceCardLayout,
  scoreVariants,
  layoutVariants,
  SOURCE_ICONS,
  scoreTier,
  formatScore,
} from './mn-source-cards.helpers'

export type { SourceCard, SourceCardLayout } from './mn-source-cards.helpers'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MnSourceCardsProps
  extends VariantProps<typeof layoutVariants> {
  cards: SourceCard[]
  onSelect?: (card: SourceCard) => void
  maxVisible?: number
  layout?: SourceCardLayout
  ariaLabel?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Card item
// ---------------------------------------------------------------------------

function SourceCardItem({
  card,
  onSelect,
  isList,
}: {
  card: SourceCard
  onSelect?: (card: SourceCard) => void
  isList: boolean
}) {
  const iconKey = card.badge?.toLowerCase() ?? ''
  const IconComponent = SOURCE_ICONS[iconKey] ?? FileText
  const ariaLabel = [
    card.title,
    card.score !== undefined ? `relevance ${formatScore(card.score)}` : null,
  ]
    .filter(Boolean)
    .join(' \u2013 ')

  const handleClick = useCallback(() => onSelect?.(card), [onSelect, card])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect?.(card)
      }
    },
    [onSelect, card],
  )

  return (
    <article
      role="listitem"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onSelect ? handleClick : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      className={cn(
        'group flex flex-col gap-2 bg-card text-card-foreground transition-colors',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        onSelect && 'cursor-pointer hover:bg-muted/40',
        isList ? 'px-4 py-3' : 'rounded-lg border p-4',
      )}
    >
      {/* header: icon + badge + score */}
      <div className="flex items-center gap-2">
        <IconComponent
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        {card.badge && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
            {card.badge}
          </span>
        )}
        <span className="flex-1" />
        {card.score !== undefined && (
          <span
            className={scoreVariants({ tier: scoreTier(card.score) })}
            aria-label={`Relevance: ${formatScore(card.score)}`}
          >
            {formatScore(card.score)}
          </span>
        )}
      </div>

      {/* title */}
      <h4 className="text-sm font-medium leading-snug text-card-foreground line-clamp-2">
        {card.title}
      </h4>

      {/* excerpt */}
      {card.excerpt && (
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {card.excerpt}
        </p>
      )}

      {/* footer: source + date */}
      {(card.source || card.date) && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {card.source && <span className="truncate">{card.source}</span>}
          {card.source && card.date && (
            <span aria-hidden="true" className="text-border">&middot;</span>
          )}
          {card.date && <span className="shrink-0">{card.date}</span>}
        </div>
      )}

      {/* action */}
      {card.action && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            card.action?.onClick()
          }}
          className={cn(
            'mt-1 inline-flex items-center gap-1 self-start rounded px-2 py-1',
            'text-xs font-medium text-primary hover:bg-primary/10',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          )}
          aria-label={`${card.action.label} for ${card.title}`}
        >
          {card.action.label}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a list or grid of source citation cards.
 *
 * Supports relevance scores with color-coded tiers, badges, excerpts,
 * optional "show more" truncation, and keyboard-accessible selection.
 */
export function MnSourceCards({
  cards,
  onSelect,
  maxVisible,
  layout = 'list',
  ariaLabel = 'Source citations',
  className,
}: MnSourceCardsProps) {
  const [expanded, setExpanded] = useState(false)

  const isList = layout === 'list'
  const visibleCards = useMemo(() => {
    if (!maxVisible || expanded) return cards
    return cards.slice(0, maxVisible)
  }, [cards, maxVisible, expanded])

  const remaining = maxVisible && !expanded ? cards.length - (maxVisible ?? 0) : 0

  if (!cards.length) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        No sources available.
      </div>
    )
  }

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn(
        'rounded-lg border bg-card overflow-hidden',
        layoutVariants({ layout }),
        className,
      )}
    >
      {visibleCards.map((card) => (
        <SourceCardItem
          key={card.id}
          card={card}
          onSelect={onSelect}
          isList={isList}
        />
      ))}

      {remaining > 0 && (
        <div className={isList ? 'px-4 py-2' : 'sm:col-span-full px-1 py-2'}>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={cn(
              'w-full rounded px-3 py-1.5 text-xs font-medium text-primary',
              'hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
            aria-label={`Show ${remaining} more source citations`}
          >
            Show {remaining} more
          </button>
        </div>
      )}
    </div>
  )
}
