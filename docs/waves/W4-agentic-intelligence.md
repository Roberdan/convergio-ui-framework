# W4 — Agentic & Intelligence

Wave 4 of Plan 10050. AI-focused visualization and operational monitoring components.

## Components

| Component | File | Purpose |
|---|---|---|
| MnAugmentedBrain | `mn-augmented-brain.tsx` | Radial AI brain visualization with animated active nodes |
| MnBinnacle | `mn-binnacle.tsx` | Severity-filtered event log with newest-first ordering |
| MnDashboardStrip | `mn-dashboard-strip.tsx` | Compact horizontal metric strip with trend indicators |
| MnInstrumentBinnacle | `mn-instrument-binnacle.tsx` | Composed panel: MnDashboardStrip + MnBinnacle |
| MnOrgChart | `mn-org-chart.tsx` | Interactive hierarchical org tree with expand/collapse |

## Design Decisions

- **SVG-only rendering** for MnAugmentedBrain — no canvas dependency, theme-aware via CSS custom properties
- **Radial layout** computed client-side; core nodes at center, memory/skill/sense in concentric layers
- **Composition over duplication** — MnInstrumentBinnacle composes existing components
- **Keyboard navigation** — MnOrgChart uses arrow keys (up/down/left/right) with tree semantics
- **Severity sidebar** in MnBinnacle uses semantic color tokens (status-warning, status-error)

## Accessibility

- All components use ARIA roles (tree, treeitem, log, grid, button)
- Focus-visible rings on interactive elements
- Screen-reader labels include node type, status, severity
- MnOrgChart: full arrow-key navigation with expand/collapse via ArrowRight/ArrowLeft
- Trend indicators in MnDashboardStrip have text alternatives via aria-label

## Theme Support

All components use CSS custom properties: `--primary`, `--foreground`, `--muted-foreground`,
`--card`, `--card-foreground`, `--border`, `--ring`, `--status-success`, `--status-warning`,
`--status-error`, `--chart-2` through `--chart-4`. Works across all 4 themes.

## Line Counts

| File | Lines |
|---|---|
| mn-augmented-brain.tsx | 236 |
| mn-binnacle.tsx | 145 |
| mn-dashboard-strip.tsx | 80 |
| mn-instrument-binnacle.tsx | 49 |
| mn-org-chart.tsx | 230 |
