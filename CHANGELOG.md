# Changelog

## [Unreleased]

### W1: Runtime source of truth

- Changed: app metadata, nav, themes, AI registry, and dashboard page config now load from `convergio.yaml` via `src/lib/config-loader.ts`
- Changed: `src/config/app.ts`, `navigation.ts`, `ai.config.ts`, `pages/dashboard.config.ts` are now deprecated re-exports
- Added: `src/lib/icon-map.ts` — maps Lucide icon name strings to components at runtime
- Changed: `NavItem.icon` type from `LucideIcon` to `iconName: string` (resolved client-side)
- Added: `vitest.config.ts` for kernel gate compatibility
- Learnings: kernel evidence gate runs `npx vitest run` — projects without Vitest need a config with `passWithNoTests: true`
