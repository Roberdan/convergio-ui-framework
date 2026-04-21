import { clsx, type ClassValue } from "clsx"
import type { CSSProperties } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * `CSSProperties` extended with CSS custom properties (e.g. `--tw-ring-color`).
 * Use this type on inline `style` props instead of `@ts-expect-error` when
 * setting CSS variables at runtime.
 */
export type StyleWithVars = CSSProperties & Record<`--${string}`, string>
