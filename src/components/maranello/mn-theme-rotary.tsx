"use client"

import { useCallback, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useTheme, type Theme } from "@/components/theme/theme-provider"

// ---------------------------------------------------------------------------
// Theme positions on the dial (angles in degrees, 0 = top)
// ---------------------------------------------------------------------------

interface ThemePosition {
  mode: Theme
  label: string
  abbr: string
  angle: number
}

const POSITIONS: ThemePosition[] = [
  { mode: "light", label: "Light", abbr: "LT", angle: -45 },
  { mode: "dark", label: "Dark", abbr: "DK", angle: 45 },
  { mode: "navy", label: "Navy", abbr: "NV", angle: 135 },
  { mode: "colorblind", label: "Colorblind", abbr: "CB", angle: 225 },
]

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const mnThemeRotaryVariants = cva("inline-flex flex-col items-center select-none gap-2", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const DIAL_SIZES: Record<string, number> = { sm: 100, md: 140, lg: 180 }

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MnThemeRotaryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof mnThemeRotaryVariants> {}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `MnThemeRotary` is a rotary-dial theme selector showing all four themes
 * arranged in a circle with a pointer indicating the active one.
 *
 * Ported from the `<mn-theme-rotary>` web component. Integrates with the
 * existing `ThemeProvider` via the `useTheme` hook.
 */
export function MnThemeRotary({
  size = "md",
  className,
  ...props
}: MnThemeRotaryProps) {
  const { theme, setTheme } = useTheme()
  const labelsRef = useRef<Map<Theme, HTMLDivElement>>(new Map())

  const dialSize = DIAL_SIZES[size ?? "md"] ?? 140
  const center = dialSize / 2
  const labelRadius = dialSize / 2 + 18
  const pointerLen = dialSize * 0.18
  const centerSize = dialSize * 0.32

  const activePos = POSITIONS.find((p) => p.mode === theme) ?? POSITIONS[0]

  const handleSelect = useCallback(
    (mode: Theme) => {
      setTheme(mode)
      labelsRef.current.get(mode)?.focus()
    },
    [setTheme],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = POSITIONS.findIndex((p) => p.mode === theme)
      let next = idx

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault()
          next = (idx + 1) % POSITIONS.length
          break
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault()
          next = (idx - 1 + POSITIONS.length) % POSITIONS.length
          break
        case "Home":
          e.preventDefault()
          next = 0
          break
        case "End":
          e.preventDefault()
          next = POSITIONS.length - 1
          break
        default:
          return
      }

      const nextMode = POSITIONS[next].mode
      setTheme(nextMode)
      labelsRef.current.get(nextMode)?.focus()
    },
    [theme, setTheme],
  )

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      onKeyDown={handleKeyDown}
      {...props}
      className={cn(mnThemeRotaryVariants({ size }), className)}
    >
      {/* Dial container */}
      <div className="relative" style={{ width: dialSize, height: dialSize }}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[var(--mn-border)] pointer-events-none" />

        {/* Rotating pointer */}
        <div
          className="absolute top-2 left-1/2 w-0.5 rounded-sm bg-[var(--mn-accent)] pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            height: pointerLen,
            transformOrigin: `50% ${center - 8}px`,
            transform: `translateX(-50%) rotate(${activePos.angle}deg)`,
          }}
        />

        {/* Position labels */}
        {POSITIONS.map((pos) => {
          const rad = (pos.angle - 90) * (Math.PI / 180)
          const x = center + Math.cos(rad) * labelRadius
          const y = center + Math.sin(rad) * labelRadius
          const isActive = pos.mode === theme

          return (
            <div
              key={pos.mode}
              ref={(el) => {
                if (el) labelsRef.current.set(pos.mode, el)
                else labelsRef.current.delete(pos.mode)
              }}
              role="radio"
              aria-checked={isActive}
              aria-label={pos.label}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(pos.mode)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap",
                "font-[var(--font-body,sans-serif)] text-[0.55rem] uppercase tracking-wider",
                "transition-colors duration-150",
                isActive
                  ? "text-[var(--mn-text)] font-bold"
                  : "text-[var(--mn-text-muted)]",
              )}
              style={{ left: x, top: y }}
            >
              {pos.abbr}
            </div>
          )
        })}

        {/* Center hub */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "flex items-center justify-center rounded-full pointer-events-none",
            "bg-[radial-gradient(circle_at_40%_35%,var(--mn-border),var(--mn-surface-raised))]",
            "shadow-[0_3px_8px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.15)]",
          )}
          style={{ width: centerSize, height: centerSize }}
        >
          <span className="block h-2 w-2 rounded-full bg-[var(--mn-accent)] opacity-80" />
        </div>
      </div>
    </div>
  )
}

export { mnThemeRotaryVariants }
