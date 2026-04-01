# Changelog

## [Unreleased]

### W0: Maranello Design System Migration — Foundation

- Ported 329 `--mn-*` CSS custom properties from convergio-design into `globals.css`
- Added semantic token definitions for all 4 themes: navy (default), light/avorio, dark/nero, colorblind
- Token categories: color primitives (Ferrari palette, status, Okabe-Ito), spacing, typography, shadow, transition, z-index
- Bridged shadcn CSS variables to reference `--mn-*` tokens where applicable
- Created `src/components/maranello/` directory with barrel `index.ts` for upcoming component migration
- No new npm dependencies added — all token values inlined

### W1: Runtime source of truth

- Changed: app metadata, nav, themes, AI registry, and dashboard page config now load from `convergio.yaml` via `src/lib/config-loader.ts`
- Changed: `src/config/app.ts`, `navigation.ts`, `ai.config.ts`, `pages/dashboard.config.ts` are now deprecated re-exports
- Added: `src/lib/icon-map.ts` — maps Lucide icon name strings to components at runtime
- Changed: `NavItem.icon` type from `LucideIcon` to `iconName: string` (resolved client-side)
- Added: `vitest.config.ts` for kernel gate compatibility
- Learnings: kernel evidence gate runs `npx vitest run` — projects without Vitest need a config with `passWithNoTests: true`

### W2: Starter baseline neutralization

- Changed: activity feed, agent table, and notifications now use generic internal-tools copy
- Removed: all Plan 10035, alfa-01, Thor, ws-44bf, header-shell-followups references
- Changed: convergio.yaml seeded data uses generic deployment/worker examples

### W3: Server-first data path

- Changed: `src/lib/env.ts` validates API_URL with sensible default
- Changed: `src/lib/api/client.ts` uses validated env for baseUrl
- Changed: `src/lib/actions/profile.ts` wired to real API call with graceful fallback
- Changed: `src/app/(dashboard)/settings/page.tsx` uses `useActionState` for form submission
- Changed: `src/app/api/health/route.ts` includes version from package.json
- Pattern: server actions catch network errors gracefully for starter mode (no backend)

### W4: AI routing hardening

- Changed: `src/app/api/chat/route.ts` uses `resolveModel()` with provider switching (openai/anthropic/custom)
- Added: exhaustive compile-time provider check prevents silent fallback
- Added: anthropic and custom providers return 501 with setup guidance

### W5: Auth boundary wiring

- Changed: `src/proxy.ts` now enforces session cookie check on protected routes
- Changed: `src/app/(auth)/login/page.tsx` wired with server action (demo: admin/admin)
- Added: logout server action + sign-out button in dashboard layout
- Changed: `e2e/shell.spec.ts` injects session cookie for test bypass

### W6: Starter productization

- Changed: README.md fully rewritten to match actual starter state (155 lines)
- Fixed: Next.js version 15 → 16 in docs
- Added: convergio.yaml, server-first data, auth boundary, AI routing sections to README
- Kept: Tauri section clearly marked as optional

### TF: Closure

- Fixed: E2E tests now include auth cookie in all spec files (themes, zero-errors)
- Validated: 38/38 E2E pass, typecheck clean, build clean
- Added: MPL-2.0 license file
- Pushed: repo live at https://github.com/Roberdan/convergio-frontend
