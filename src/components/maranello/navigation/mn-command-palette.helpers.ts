import { cva } from "class-variance-authority"

export const backdropVariants = cva(
  "fixed inset-0 z-[9500] flex items-start justify-center pt-[20vh] bg-black/50 transition-opacity duration-200",
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

export interface CommandItem {
  text: string
  icon?: string
  shortcut?: string
  group?: string
}

export interface MnCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CommandItem[]
  onSelect?: (item: CommandItem) => void
  /** @default "Type a command…" */
  placeholder?: string
  /** Register global Cmd+K / Ctrl+K hotkey. @default true */
  globalHotkey?: boolean
  className?: string
}
