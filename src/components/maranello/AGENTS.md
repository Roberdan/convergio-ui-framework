# Maranello Components

103 React components with `Mn` prefix. CVA + cn() for variants. `"use client"` only if hooks used.

## Categories

| Dir | Count | Domain | Specialist |
|-----|-------|--------|-----------|
| `agentic/` | 14 | Agent traces, brain3d, workflows, missions | Nasra |
| `data-display/` | 12 | Tables, avatars, badges, feeds, detail panels | Jony |
| `data-viz/` | 14 | Charts, gauges, funnels, heatmaps, speedometers | Nasra |
| `feedback/` | 6 | Toasts, modals, spinners, state scaffolds | Baccio |
| `financial/` | 2 | FinOps, cost breakdown | Nasra |
| `forms/` | 11 | Form fields, selects, date pickers, profiles | Jony |
| `layout/` | 8 | Dashboards, grids, section cards, panels | Sara |
| `navigation/` | 5 | Breadcrumbs, tabs, section nav, command palette | Sara |
| `network/` | 10 | Mesh network, maps, system status, org charts | Nasra |
| `ops/` | 8 | Gantt, kanban, deployment tables, night jobs | Jony |
| `shared/` | 2 | Format helpers, test utilities | — |
| `strategy/` | 11 | OKR, SWOT, risk matrix, BCG, porter, canvas | Sara |
| `theme/` | 6 | A11y fab, theme toggle/rotary, design tokens | Baccio |

## Creating a component

1. File: `{category}/mn-your-component.tsx`
2. Prefix: `Mn` (e.g. `MnYourComponent`)
3. Export: named only, add to `index.ts` barrel
4. Colors: `var(--mn-*)` tokens, never hex
5. Max 250 lines — extract to `.helpers.ts`
6. Registry: add JSON to `public/r/` for shadcn install

## Finding the right component

Search `src/lib/component-catalog-data.ts` by keyword. Read `whenToUse` field.
