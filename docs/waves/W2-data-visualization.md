# W2 — Advanced Data Visualization

Plan 10050, Wave 2515. SVG + CSS only, no charting libraries.

## Components

| Component | File | Purpose |
|---|---|---|
| MnHeatmap | `mn-heatmap.tsx` | Grid-based heatmap with color intensity mapping |
| MnBudgetTreemap | `mn-budget-treemap.tsx` | Proportional treemap for budget visualization |
| MnWaterfall | `mn-waterfall.tsx` | Waterfall chart for financial/flow analysis |
| MnDecisionMatrix | `mn-decision-matrix.tsx` | Weighted criteria decision table |
| MnPipelineRanking | `mn-pipeline-ranking.tsx` | Horizontal funnel with conversion rates |
| MnActivityFeed | `mn-activity-feed.tsx` | Enhanced feed with time grouping + priorities |

## Accessibility

- All components: keyboard navigable, ARIA labels, focus-visible rings
- MnHeatmap: `role="grid"`, arrow-key cell navigation
- MnDecisionMatrix: sortable table, screen-reader score descriptions
- MnActivityFeed: `aria-live="polite"` for auto-refresh updates
- Priority badges: color + text label (no color-only indicators)

## Theming

- All colors via CSS custom properties (`--primary`, `--muted`, etc.)
- No hardcoded colors; fallback chart palette uses `var(--chart-N)`
- Works across all 4 themes via semantic tokens

## Usage

```tsx
import { MnHeatmap, MnWaterfall, MnDecisionMatrix } from '@/components/maranello';
```

## Barrel

All W2 exports added to `src/components/maranello/index.ts`.
