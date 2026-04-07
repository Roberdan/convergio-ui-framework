# Convergio Frontend — Constitution

> Binding governance rules for this repository. These are conventions and policies
> enforced by code review and plan execution — not runtime code.
> No exceptions.

## Principles

| # | Principle |
|---|-----------|
| P1 | Accessibility first — WCAG 2.2 AA minimum |
| P2 | Zero emoji — Lucide SVG icons only |
| P3 | 4 themes always — navy, dark, light, colorblind |
| P4 | Max 250 lines per file — split if exceeds |
| P5 | shadcn source-first — components live in repo |
| P6 | prefers-reduced-motion respected in all animations |
| P7 | All text/comments in English |
| P8 | Keyboard-first interaction model |
| P9 | No `<table>` elements — use MnDataTable for ALL tabular data |
| P10 | No custom metric cards — use MnDashboardStrip or MnKpiScorecard |
| P11 | No hardcoded hex colors in JSX — use `var(--mn-*)` tokens only |
| P12 | Always search component-catalog-data.ts before creating any UI element |

## Accessibility (WCAG 2.2 AA)

| Rule | Requirement |
|------|-------------|
| A1 | All interactive elements keyboard-navigable |
| A2 | Color contrast >= 4.5:1 text, >= 3:1 UI |
| A3 | Focus indicators visible in all themes |
| A4 | Form inputs have associated labels |
| A5 | prefers-reduced-motion disables animations |
| A6 | Font sizes use rem, never fixed px for body |
| A7 | Touch targets >= 44x44px on mobile |

## Theme Rules

| Rule | Requirement |
|------|-------------|
| T1 | Every component renders in all 4 themes |
| T2 | Use CSS custom properties, never hardcoded colors |
| T3 | Theme via data-theme attribute on html |
| T4 | Colorblind theme passes WCAG AA for deuteranopia + protanopia |

## Typography

| Rule | Requirement |
|------|-------------|
| TY1 | Headings: Outfit (font-heading) |
| TY2 | Body: Inter (font-sans) |
| TY3 | Mono/data: Barlow Condensed (font-mono) |
| TY4 | Labels: Outfit uppercase, letter-spacing 0.06em |

## Code Rules

| Rule | Requirement |
|------|-------------|
| C1 | TypeScript strict, no `any` |
| C2 | Named exports only |
| C3 | No hardcoded color values |
| C4 | "use client" only where hooks are used |

## Plan Execution (NON-NEGOTIABLE)

| Rule | Requirement |
|------|-------------|
| X1 | **ONLY Thor can set task status=done.** No executor, no agent, no human bypass. |
| X2 | Task lifecycle: `pending → in_progress → submitted → done (Thor only)` |
| X3 | After ALL wave tasks reach `submitted`: run `cvg plan validate {plan_id}` — Thor batch validates |
| X4 | NEVER skip Thor gate. NEVER proceed to next wave without Thor PASS |
| X5 | NEVER use forced-admin endpoint or manual status=done |
| X6 | Post test evidence BEFORE submitting: `POST /api/plan-db/task/evidence` |
| X7 | Every task must pass its `verify[]` commands before reaching `submitted` |
| X8 | Plans execute on worktrees, NEVER on the main repo checkout |
