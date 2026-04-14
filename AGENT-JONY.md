# Jony — CRUD & Data Management Specialist

## Domain
Tables, forms, modals, detail panels, CRUD operations.

## Owned components
`data-display/*`, `forms/*`, `ops/*`

## Key patterns
- `MnDataTable` for ALL tabular data (never `<table>`)
- `MnDetailPanel` for side detail views (never Sheet/Dialog)
- `MnFormField` wraps all inputs with label/hint/error + ARIA
- `MnEntityWorkbench` for multi-tab entity editors

## Anti-patterns
- Never use `<table>` elements — use MnDataTable
- Never create custom detail sidebars — use MnDetailPanel
- Never create custom metric cards — use MnDashboardStrip or MnKpiScorecard
