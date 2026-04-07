# Maranello Design System — AI Instructions

## Core Rules (NON-NEGOTIABLE)
1. **CONSTITUTION P2**: Zero emoji in JSX — Lucide SVG icons ONLY
2. **No custom UI**: Search `component-catalog-data.ts` BEFORE writing any component
3. **No hardcoded colors**: Use `var(--mn-*)` tokens exclusively
4. **No raw HTML elements**: Use Maranello components for tables, forms, panels, charts

## Component Selection — MANDATORY lookup
Before creating ANY UI element, search the catalog by intent:

| Need | Use | NOT |
|------|-----|-----|
| KPI metrics strip | `MnDashboardStrip` | Custom divs with numbers |
| Data table | `MnDataTable` | `<table>` or custom grid |
| Side detail panel | `MnDetailPanel` | Sheet, Dialog, custom sidebar |
| Horizontal bars | `MnHbar` | Custom div bars |
| Vertical bar/line/area chart | `MnChart` | recharts/chart.js direct |
| Funnel visualization | `MnFunnel` (large) or `MnHbar` (compact) | Custom SVG |
| Gauge/meter | `MnGauge`, `MnHalfGauge`, `MnSpeedometer` | Custom SVG circles |
| Progress | `MnProgressRing` | Custom progress bars |
| Heatmap | `MnHeatmap` | Custom table with colors |
| Gantt timeline | `MnGantt` | Custom timeline divs |
| Status indicator | `MnBadge` | Colored spans |
| Loading state | `MnStateScaffold` | Custom loading spinners |
| Card container | `MnSectionCard` | Custom bordered divs |
| Filter panel | `MnFilterPanel` or `MnFacetWorkbench` | Custom select dropdowns |
| Tab navigation | `MnTabs` | Custom tab divs |
| Form fields | `MnFormField` | Raw input elements |
| Search | `MnSearchDrawer` or `MnCommandPalette` | Custom search inputs |
| Kanban | `MnKanbanBoard` | Custom column layout |
| Animated numbers | `MnFlipCounter` | Static number display |
| Dashboard layout | `MnDashboard` or `MnGridLayout` | Custom flex/grid divs |
| Icon | Lucide React import | Emoji, Unicode symbols, custom SVG |
| KPI scorecard | `MnKpiScorecard` | Custom metric cards |
| OKR tracker | `MnOkr` | Custom objective lists |
| Risk matrix | `MnRiskMatrix` | Custom colored grids |
| Decision matrix | `MnDecisionMatrix` | Custom scoring tables |
| Org chart | `MnOrgChart` | Custom nested divs |
| Activity feed | `MnActivityFeed` | Custom event lists |
| Modal | `MnModal` | Raw dialog element |
| Toast | `MnToast` | Custom alert divs |
| Stepper/wizard | `MnStepper` | Custom step indicators |
| Breadcrumb | `MnBreadcrumb` | Custom path links |

## How to find the right component
1. Open `src/lib/component-catalog-data.ts`
2. Search by keyword (supports EN and IT): e.g., "table", "chart", "gauge"
3. Read the `whenToUse` field — it tells you exactly when to use it
4. Read the component's `.tsx` file to understand its props interface
5. NEVER create a custom component when a Maranello one exists

## Color Tokens (never use hex literals)
```css
/* Accent */
var(--mn-accent)           /* Primary action color */
var(--mn-accent-hover)     /* Hover state */
var(--mn-accent-text)      /* Text on accent */
var(--mn-accent-bg)        /* Subtle accent background */
var(--mn-accent-border)    /* Accent-tinted border */

/* Status */
var(--mn-success)          /* Green — positive */
var(--mn-success-bg)       /* Success background */
var(--mn-warning)          /* Yellow — caution */
var(--mn-warning-bg)       /* Warning background */
var(--mn-error)            /* Red — danger */
var(--mn-error-bg)         /* Error background */
var(--mn-info)             /* Blue — informational */
var(--mn-info-bg)          /* Info background */

/* Text */
var(--mn-text)             /* Primary text */
var(--mn-text-muted)       /* Secondary text */
var(--mn-text-tertiary)    /* Tertiary text */
var(--mn-text-disabled)    /* Disabled text */
var(--mn-text-inverse)     /* Inverse text */

/* Surface */
var(--mn-surface)          /* Background */
var(--mn-surface-raised)   /* Elevated surface (cards) */
var(--mn-surface-sunken)   /* Recessed surface */
var(--mn-surface-input)    /* Input field background */
var(--mn-surface-overlay)  /* Overlay/popover background */
var(--mn-surface-hover)    /* Hover state background */

/* Border */
var(--mn-border)           /* Default border */
var(--mn-border-subtle)    /* Subtle separator */
var(--mn-border-strong)    /* Emphasized border */
var(--mn-border-focus)     /* Focus ring border */

/* Interactive */
var(--mn-hover-bg)         /* Hover background */
var(--mn-active-bg)        /* Active/pressed background */
var(--mn-focus-ring)       /* Focus ring color */
```

## Page Composition Pattern
Every page should follow this structure:
1. Import data-fetching functions (API layer)
2. Import Maranello components (NO custom UI)
3. Map API data to component props (pure transforms)
4. Compose components in a layout

```tsx
// CORRECT — data mapping only, zero custom UI
export default function DashboardPage() {
  const data = useApiQuery(() => fetchData());
  const metrics = buildMetrics(data);     // pure data transform
  const tableRows = buildRows(data);      // pure data transform
  return (
    <>
      <MnDashboardStrip metrics={metrics} />
      <MnDataTable columns={COLS} data={tableRows} />
    </>
  );
}

// WRONG — custom UI elements
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="rounded-lg border p-4">  {/* custom card */}
        <span className="text-2xl font-bold">55</span>
      </div>
    </div>
  );
}
```

## Import Convention

```tsx
// Maranello components — import from barrel
import { MnDataTable, MnBadge, MnDashboardStrip } from "@/components/maranello"

// Icons — import from lucide-react
import { BarChart3, Users, TrendingUp } from "lucide-react"

// Utils
import { cn } from "@/lib/utils"
```

## File Rules
- Max 250 lines per file (CONSTITUTION P4) — extract to `.helpers.ts` if needed
- Named exports only — never `export default` for components
- `"use client"` only when hooks are actually used
- TypeScript strict — no `any` types
- All colors via `--mn-*` CSS variables — NEVER hardcoded hex
