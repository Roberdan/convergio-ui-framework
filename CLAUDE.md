# Convergio UI Framework — AI Instructions

## Quick start
Read `AGENTS.md` for project overview. Each `src/` subdirectory has its own `AGENTS.md`.

## Rules (NON-NEGOTIABLE)
1. **No hardcoded colors** — `var(--mn-*)` tokens only
2. **4 themes** — navy, dark, light, colorblind. Test all.
3. **Lucide icons only** — zero emoji (CONSTITUTION P2)
4. **250 lines max per file** — split to `.helpers.ts`
5. **Named exports only** — no `export default`
6. **TypeScript strict** — no `any`
7. **WCAG 2.2 AA** — keyboard nav, focus rings, ARIA
8. **i18n** — `useLocale("ns")` for all UI strings, no hardcoded English
9. **Catalog-first** — search `src/lib/component-catalog-data.ts` before creating UI
10. **No raw HTML tables** — use `MnDataTable`
11. **No custom metric cards** — use `MnDashboardStrip` or `MnKpiScorecard`

## Component lookup
Search `src/lib/component-catalog-data.ts` by keyword. Read the `whenToUse` field.
Or use the MCP server: `pnpm mcp` → `search_components` tool.

## Import convention
```tsx
import { MnDataTable, MnBadge } from "@/components/maranello";
import { useLocale } from "@/lib/i18n";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
```

## Color tokens
```css
var(--mn-accent)       var(--mn-surface)       var(--mn-text)
var(--mn-success)      var(--mn-surface-raised) var(--mn-text-muted)
var(--mn-warning)      var(--mn-surface-sunken) var(--mn-border)
var(--mn-error)        var(--mn-hover-bg)       var(--mn-focus-ring)
```

## Page composition
```tsx
// CORRECT — Maranello components only, data mapping
export function Page() {
  const data = useApiQuery(() => fetchData());
  return (
    <>
      <MnDashboardStrip metrics={buildMetrics(data)} />
      <MnDataTable columns={COLS} data={buildRows(data)} />
    </>
  );
}
```
