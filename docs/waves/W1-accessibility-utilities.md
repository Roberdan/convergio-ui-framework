# W1 — Accessibility + Utilities

Plan 10050, Wave 2514. Implemented 01 Aprile 2026.

## Components

| Component | File | Purpose |
|---|---|---|
| MnA11yFab | `mn-a11y-fab.tsx` | Floating accessibility settings (font size, OpenDyslexic, high contrast, reduced motion) |
| MnSpinner | `mn-spinner.tsx` | Animated loading spinner (sm/md/lg, primary/muted/destructive) |
| MnStepper | `mn-stepper.tsx` | Horizontal step wizard (done/current/pending states) |
| MnToggleSwitch | `mn-toggle-switch.tsx` | Accessible toggle (role=switch, aria-checked, label association) |
| MnDropdownMenu | `mn-dropdown-menu.tsx` | Dropdown menu with keyboard nav (Arrow/Escape/Home/End) |
| MnCalendarRange | `mn-calendar-range.tsx` | Date range picker with native inputs and validation |

## Accessibility

- All components use `focus-visible` ring from design tokens
- MnA11yFab persists preferences to localStorage and applies via CSS classes on `<html>`
- MnToggleSwitch uses `role="switch"` + `aria-checked` per WAI-ARIA
- MnDropdownMenu supports full keyboard navigation (ArrowUp/Down, Home, End, Escape)
- MnCalendarRange uses native `<input type="date">` for built-in a11y
- MnStepper uses `aria-current="step"` on the active step

## Theming

All components use CSS custom properties (`var(--primary)`, `var(--border)`, etc.) and work across all four themes (Navy, Light, Dark, Colorblind).

## CSS additions

`globals.css` gains utility classes: `.mn-font-large`, `.mn-font-xl`, `.mn-dyslexic`, `.mn-high-contrast`, `.mn-reduced-motion`.

## Barrel

All exports consolidated in `src/components/maranello/index.ts`.
