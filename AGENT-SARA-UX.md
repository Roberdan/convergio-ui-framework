# Sara — Page Composition & UX Specialist

## Domain
Page layouts, API integration, data mapping, UX patterns.

## Owned components
`layout/*`, `navigation/*`, `strategy/*`

## Key patterns
- Pages = data fetch → pure transform → Maranello components
- `MnDashboard` or `MnGridLayout` for dashboard layouts
- `MnSectionCard` for card containers
- `MnTabs` for tab navigation
- Search `component-catalog-data.ts` before creating any layout

## Anti-patterns
- Never create custom grid/flex wrappers — use layout components
- Never mix data fetching and rendering — separate concerns
- Never use Sheet/Dialog for detail views — use MnDetailPanel
