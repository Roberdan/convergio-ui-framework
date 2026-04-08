"use client"

import { useCallback } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useTheme, type Theme } from "@/components/theme/theme-provider"

// ---------------------------------------------------------------------------
// Theme metadata
// ---------------------------------------------------------------------------

const THEME_META: Record<Theme, { icon: string; label: string }> = {
  light: { icon: "◑", label: "Light" },
  dark: { icon: "●", label: "Dark" },
  navy: { icon: "⚓", label: "Navy" },
  colorblind: { icon: "◐", label: "Colorblind" },
}

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const mnThemeToggleVariants = cva(
  [
    "inline-flex items-center justify-center rounded-full",
    "border border-[var(--mn-border)]",
    "bg-[var(--mn-surface-raised)] text-[var(--mn-text-tertiary)]",
    "cursor-pointer select-none",
    "transition-[background,transform,border-color] duration-150",
    "shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
    "hover:bg-[var(--mn-border)] hover:scale-[1.08]",
    "focus-visible:outline-2 focus-visible:outline-[var(--mn-accent)] focus-visible:outline-offset-2",
  ],
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-base",
        md: "h-10 w-10 text-xl",
        lg: "h-12 w-12 text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
)

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MnThemeToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof mnThemeToggleVariants> {
  /** Show the theme label next to the icon. */
  showLabel?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `MnThemeToggle` cycles through the available themes on each click.
 *
 * Ported from the `<mn-theme-toggle>` web component. Integrates with the
 * existing `ThemeProvider` via the `useTheme` hook.
 */
export function MnThemeToggle({
  size,
  showLabel = false,
  className,
  ...props
}: MnThemeToggleProps) {
  const { theme, setTheme, themes } = useTheme()

  const cycle = useCallback(() => {
    const idx = themes.indexOf(theme)
    const next = themes[(idx + 1) % themes.length]
    setTheme(next)
  }, [theme, setTheme, themes])

  const meta = THEME_META[theme]

  if (showLabel) {
    return (
      <button
        {...props}
        type="button"
        aria-label={`Current theme: ${meta.label}. Click to switch.`}
        title={meta.label}
        onClick={cycle}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
          "border border-[var(--mn-border)]",
          "bg-[var(--mn-surface-raised)] text-[var(--mn-text-tertiary)]",
          "cursor-pointer select-none text-sm",
          "transition-[background,transform,border-color] duration-150",
          "shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
          "hover:bg-[var(--mn-border)] hover:scale-[1.02]",
          "focus-visible:outline-2 focus-visible:outline-[var(--mn-accent)] focus-visible:outline-offset-2",
          className,
        )}
      >
        <span className="text-lg" aria-hidden="true">
          {meta.icon}
        </span>
        <span>{meta.label}</span>
      </button>
    )
  }

  return (
    <button
      {...props}
      type="button"
      aria-label={`Current theme: ${meta.label}. Click to switch.`}
      title={meta.label}
      onClick={cycle}
      className={cn(mnThemeToggleVariants({ size }), className)}
    >
      <span aria-hidden="true">{meta.icon}</span>
    </button>
  )
}

export { mnThemeToggleVariants }
