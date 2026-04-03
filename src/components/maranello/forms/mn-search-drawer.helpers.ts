import type { ReactNode } from "react"
import { cva } from "class-variance-authority"

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

export const searchDrawerBackdropVariants = cva(
  "fixed inset-0 z-[9500] bg-black/50 transition-opacity duration-200",
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

export const searchDrawerVariants = cva(
  "fixed inset-y-0 right-0 z-[9501] flex w-[400px] max-w-[90vw] flex-col border-l border-border bg-background shadow-2xl transition-transform duration-200",
  {
    variants: {
      visible: {
        true: "translate-x-0",
        false: "translate-x-full",
      },
    },
    defaultVariants: { visible: false },
  },
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchDrawerResult {
  id: string
  title: string
  subtitle?: string
  badge?: string
  icon?: ReactNode
}

export interface SearchDrawerSection {
  id: string
  label: string
  content: ReactNode
}

export interface MnSearchDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** @default "Search…" */
  placeholder?: string
  onSearch: (query: string) => Promise<SearchDrawerResult[]>
  onResultClick?: (result: SearchDrawerResult) => void
  sections?: SearchDrawerSection[]
  /** @default "No results found" */
  emptyMessage?: string
  className?: string
}
