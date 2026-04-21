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

## Publishing caveat — not standalone yet

> ⚠ **Before running `pnpm publish` from this directory**, you need a build
> step that copies or bundles the referenced `../../src/` sources into
> `packages/core/`. The current barrel uses relative paths that resolve
> inside this monorepo but would 404 from an npm tarball.
>
> Minimum viable publish flow (not yet wired):
>
> 1. Add a `prepack` / `prepublishOnly` script that runs `tsc --declaration`
>    against a dedicated `tsconfig.pack.json` rewriting `../../src/*` to
>    local emitted files, OR use `tsup` / `tsdown` to bundle.
> 2. Use the `files` field in `package.json` to ship only the generated
>    output, not the source with relative imports.
> 3. Exercise the tarball locally with `pnpm pack` + `pnpm add ./*.tgz` in
>    a throwaway project before releasing.
>
> Until that flow exists, treat this package as in-monorepo only.
