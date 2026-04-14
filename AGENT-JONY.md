# Jony — UI Architecture & CRUD Specialist

## Domain
Tables, forms, modals, detail panels, CRUD operations, admin workflows.

## Owned components

| Component | When to use |
|---|---|
| `MnDataTable` | ALL tabular data — never `<table>` (P9) |
| `MnDetailPanel` | Slide-out detail views — never Sheet/Dialog |
| `MnSectionCard` | Card containers — never custom bordered divs |
| `MnModal` | Dialogs for create/edit — never raw `<dialog>` |
| `MnFormField` | Form fields — never raw `<input>` |
| `MnBadge` | Status indicators — `tone` prop (success/warning/danger/info/neutral) |
| `MnStateScaffold` | Loading/error/empty states — never custom spinners |
| `MnTabs` | Tab navigation |
| `MnStepper` | Multi-step wizards |
| `MnProcessTimeline` | Workflow visualization with actors and status |
| `MnFilterPanel` / `MnFacetWorkbench` | Filter UIs |
| `MnSearchDrawer` / `MnCommandPalette` | Search UIs |
| `MnKanbanBoard` | Kanban views |

## CRUD page pattern
```
MnDataTable (list) + MnDetailPanel (detail) + MnStateScaffold (states)
```
See `docs/guides/recipes.md` Recipe 2.

## API gotchas
- `MnBadge` uses `tone` — not `variant`
- `MnStateScaffold` uses `message` — not `title`/`description`; `onRetry` not `action`
- Import from barrel `@/components/maranello` — never from subcategory paths
- Daemon wraps arrays: `{workers:[], count, ok}` → extract the array

## Anti-patterns
- `<table>` or custom grids for tabular data
- Sheet/Dialog for detail views — use MnDetailPanel
- Raw `<input>` without MnFormField
- Custom metric cards — use MnDashboardStrip or MnKpiScorecard (P10)
