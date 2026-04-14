# Convergio UI Framework — Agent Guide

Config-driven dashboard framework. 103 Maranello components, 4 themes, Next.js 16.

## Quick orientation

| Directory | What | Guide |
|-----------|------|-------|
| `src/components/maranello/` | 103 Mn* design system components | Each category has its own AGENTS.md |
| `src/components/shell/` | App shell (sidebar, header, layout) | [AGENTS.md](src/components/shell/AGENTS.md) |
| `src/components/blocks/` | Built-in page blocks (KPI, table, feed) | [AGENTS.md](src/components/blocks/AGENTS.md) |
| `src/lib/` | Config loader, block registry, i18n, utils | [AGENTS.md](src/lib/AGENTS.md) |
| `src/hooks/` | Data fetching, SSE, real-time hooks | [AGENTS.md](src/hooks/AGENTS.md) |
| `src/app/` | Next.js routes (dashboard, showcase, API) | [AGENTS.md](src/app/AGENTS.md) |
| `src/mcp/` | MCP server for AI agents (Nasra tools) | [AGENTS.md](src/mcp/AGENTS.md) |
| `src/types/` | TypeScript types (config, AI, blocks) | [AGENTS.md](src/types/AGENTS.md) |
| `packages/core/` | @convergio/core npm package (re-exports) | [AGENTS.md](packages/core/AGENTS.md) |

## Rules (apply everywhere)

1. **No hardcoded colors** — `var(--mn-*)` tokens only
2. **4 themes** — navy, dark, light, colorblind. Test all.
3. **Lucide icons only** — zero emoji
4. **250 lines max per file** — split to `.helpers.ts`
5. **Named exports only** — no `export default`
6. **TypeScript strict** — no `any`
7. **WCAG 2.2 AA** — keyboard nav, focus rings, ARIA
8. **i18n** — `useLocale("ns")` for all UI strings
9. **Catalog-first** — search `component-catalog-data.ts` before creating UI

## Build commands

```bash
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
pnpm test       # Vitest
pnpm test:e2e   # Playwright
pnpm mcp        # MCP server
```
