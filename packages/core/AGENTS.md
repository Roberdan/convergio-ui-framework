# @convergio/core

NPM package re-exporting framework essentials from `src/`.

| Subpath | Exports |
|---------|---------|
| `@convergio/core` | Everything (barrel) |
| `@convergio/core/shell` | AppShell, Sidebar, Header, SearchCombobox |
| `@convergio/core/config` | loadAppConfig, loadNavSections, schemas |
| `@convergio/core/theme` | ThemeProvider, ThemeSwitcher, ThemeScript |
| `@convergio/core/hooks` | useApiQuery, useSSEAdapter, 5 convenience hooks |
| `@convergio/core/blocks` | KpiCard, DataTable, ActivityFeed, StatList, EmptyState, AIChatPanel |
| `@convergio/core/block-registry` | registerBlock, lazyBlock, getBlock |
| `@convergio/core/page-renderer` | PageRenderer |

## Consumer usage
```ts
import { AppShell, loadNavSections } from "@convergio/core";
import { MnGauge } from "./components/maranello/data-viz/mn-gauge"; // installed via shadcn
```

This package has zero own code — it re-exports from `../../src/` via tsconfig path aliases.
