import type { LucideIcon } from "lucide-react"
import { FileText, Globe, Database } from "lucide-react"
import { cva } from "class-variance-authority"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SourceCard {
  id: string
  title: string
  excerpt?: string
  source?: string
  score?: number
  date?: string
  badge?: string
  action?: { label: string; onClick: () => void }
}

export type SourceCardLayout = 'list' | 'grid'

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

export const scoreVariants = cva(
  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
  {
    variants: {
      tier: {
        high: 'bg-[var(--mn-success-bg)] text-[var(--mn-success)] border border-[color-mix(in_srgb,var(--mn-success)_24%,transparent)]',
        mid: 'bg-[var(--mn-warning-bg)] text-[var(--mn-warning)] border border-[color-mix(in_srgb,var(--mn-warning)_24%,transparent)]',
        low: 'bg-muted text-muted-foreground border border-border',
      },
    },
    defaultVariants: { tier: 'low' },
  },
)

export const layoutVariants = cva('', {
  variants: {
    layout: {
      list: 'divide-y',
      grid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
    },
  },
  defaultVariants: { layout: 'list' },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const SOURCE_ICONS: Record<string, LucideIcon> = {
  web: Globe,
  database: Database,
  file: FileText,
}

export function scoreTier(score: number): 'high' | 'mid' | 'low' {
  if (score >= 0.8) return 'high'
  if (score >= 0.5) return 'mid'
  return 'low'
}

export function formatScore(score: number): string {
  return `${(score * 100).toFixed(0)}%`
}
