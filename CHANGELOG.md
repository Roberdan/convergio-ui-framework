# Changelog

## [1.0.0] - 07 April 2026

First stable release. Config-driven dashboard framework with 101 Maranello
components, 4 themes, 17 dashboard pages, AI chat, shadcn-compatible registry,
and complete documentation (7 guides, 102 component MDX docs).

### Night Agents Dashboard
- Feat: `/night-agents` page — KPI strip, agent definitions table, active runs, tracked projects
- Feat: typed API client (`api-night-agents.ts`) for all night-agents daemon endpoints
- Feat: TypeScript types (`types/night-agents.ts`) mirroring daemon Rust crate
- Feat: sidebar navigation entry under Operations (Moon icon)

### DX Improvements
- Docs: `CLAUDE.md` — AI-first instructions with mandatory component selection table (30+ mappings)
- Docs: `docs/guides/recipes.md` — 5 composition patterns (OKR Dashboard, CRUD Page, Analytics, Gantt+Detail, Simulator)
- Docs: `docs/guides/common-mistakes.md` — 10 real mistakes with wrong vs correct code examples
- Feat: CONSTITUTION P9-P12 enforcement rules (no custom tables, no custom metric cards, no hardcoded hex, mandatory catalog search)
- Feat: prescriptive `whenToUse` fields in `component-catalog-data.ts` for MnDataTable, MnDetailPanel, MnDashboardStrip, MnHbar, MnBadge

### Housekeeping
- Fix: unified night-agents types (removed duplicate `types-night-agents.ts`)
- Fix: aligned doc examples with actual component APIs (`tone` not `variant`, correct `MnStateScaffold` props)
- Fix: night-agents page uses `MnDashboardStrip` instead of custom KpiCard (P10 compliance)
- Fix: removed stale worktree, cleaned up merged/orphan branches and redundant PR
- Docs: updated README and AGENTS.md — component count (101), new routes, new guides, P9-P12 rules
- CI: E2E tests non-blocking (require daemon at localhost:8420)

## [0.3.0] - 06 April 2026

### Documentation & Onboarding
- Docs: rewrote README.md — framework-first onboarding, two usage modes (framework vs registry), concrete YAML quickstart, mental model diagram, custom pages guide
- Docs: created AGENTS.md — complete guide for AI coding agents (mental model, key files, conventions, common mistakes)
- Chore: cleaned up 11 stale git branches (4 merged remote + 7 squash-merged remote + 1 local)

### W1: Fix & Restructure
- Refactor: split 3 oversized files (gauge, date-range-picker, command-palette) into component + helpers
- Refactor: fix network barrel exports (3 missing components)
- Fix: replace hardcoded hex colors in 9 files with --mn-* CSS custom properties
- Fix: Ferrari Controls, gauge, speedometer cross-theme contrast
- Refactor: remove /preview, unify all content under /showcase/[category]
- Fix: sidebar navigation with 12 category sections + Cmd-K update

### W2: Complete Showcase + A11y
- Feat: add live demos for 34 missing components across all categories
- Feat: component catalog (100 entries) with bilingual EN/IT fuzzy search
- Feat: Cmd-K fuzzy component search across name, description, keywords
- Fix: A11y — MnA11yFab global, skip-to-content, aria-labels, focus rings
- Feat: inline component documentation with props table + code snippets

### W3: Guides & MDX Documentation
- Docs: 100 .mdx component documentation files + generation script
- Docs: guide "Creating a new component" with full example
- Docs: guide "Adding icons" (Lucide-only policy)
- Docs: guide "Extending the design system" (categories, themes, tokens, WCAG)
- Chore: regenerated shadcn registry (104 files, 13 helpers bundled)

## [0.2.1] - 03 April 2026

### Documentation Cleanup
- Rewrote README.md: accurate component count (100), correct AI SDK version (v6), proper architecture diagram, env var table, accurate config-driven docs
- Deleted stale docs: waves/, PHASE2-SUMMARY.md, WT-test-foundation.md, plan-10040-notes.md
- Fixed CONSTITUTION.md: clarified as governance/policy doc
- Fixed ADR-0001: corrected enforcement reference
- Fixed docs/guides/adding-a-theme.md: WCAG 2.1 → 2.2
- Fixed package.json: version 0.2.0, added description, added `test` script, removed dead `format` scripts
- Fixed src-tauri/tauri.conf.json: updated productName/identifier/title
- Fixed src/lib/config-loader.ts: accurate JSDoc (runtime + build, unused fields noted)
- Fixed src/lib/env.ts: added JSDoc for all fields
- Fixed src/lib/session.ts: documented fallback secret

## [0.2.0] - 01 April 2026

### Phase 2: Expert Review Hardening + Maranello Components

Plan 10050 | 60 tasks | 16 waves | Thor validated

#### Added
- A2UI protocol frontend consumer: SSE client, block store, renderer, dashboard widget (W0)
- WCAG 2.2 AA accessibility: focus-visible, skip links, semantic HTML, ARIA, status tokens (WA)
- Block loading/error/empty states, chat UX improvements, design token system (WQ)
- Test foundation: 51 unit tests with vitest + RTL + happy-dom (WT)
- 23 Maranello components across 6 waves:
  - W1: Accessibility + utilities (StatusBadge, SkipLink, FocusRing, ThemeSelector, ErrorBoundary)
  - W2: Advanced data visualization (SparklineChart, MetricsGrid, HeatmapGrid, ProgressRing)
  - W3: Network and infrastructure (NetworkTopology, NodeCard, LatencyIndicator, ConnectionStatus)
  - W5: Strategy and business frameworks (StrategyMatrix, ObjectiveTracker, RiskRadar, DecisionLog)
- Showcase page at /showcase with all Maranello components (WS)
- Wave documentation in docs/waves/ for all 9 waves
- Phase 2 summary documentation

#### Changed
- Foundation hardening: theme hydration, error boundaries, Zod validation, responsive layouts (WF)

#### Fixed
- Theme hydration flash on initial load
- Missing error boundaries causing white screens

## [0.1.0] - Unreleased

### W0: Maranello Design System Migration — Foundation

- Ported 329 `--mn-*` CSS custom properties from convergio-design into `globals.css`
- Added semantic token definitions for all 4 themes: navy (default), light/avorio, dark/nero, colorblind
- Token categories: color primitives (Ferrari palette, status, Okabe-Ito), spacing, typography, shadow, transition, z-index
- Bridged shadcn CSS variables to reference `--mn-*` tokens where applicable
- Created `src/components/maranello/` directory with barrel `index.ts` for upcoming component migration
- No new npm dependencies added — all token values inlined

### W1: Maranello Design System Migration — Wave 1: Simple Components

- Ported 9 simple components (10 files) as React/Tailwind/CVA:
  - `MnBadge` — semantic tone badge (success/warning/danger/info/neutral)
  - `MnAvatar` + `MnAvatarGroup` — image/initials with status indicator
  - `MnBreadcrumb` — accessible breadcrumb nav with separator
  - `MnFormField` — label/hint/error wrapper with ARIA wiring
  - `MnStateScaffold` — 5-state scaffold (loading/empty/error/partial/ready)
  - `MnToast` + `toast()` — imperative toast system with auto-dismiss
  - `MnTabs` — compound accessible tabs with keyboard nav
  - `MnModal` — portal dialog with focus trap and backdrop
  - `MnCustomerJourney` — phase-based swimlane with engagement cards
  - `MnDashboard` — schema-driven 12-column grid layout
- All components use CVA variants, cn() utility, --mn-* theme tokens
- 1,961 LOC total, all files under 250-line limit
- Barrel exports consolidated in index.ts

### W2: Maranello Design System Migration — Wave 2: Shell & Navigation

- Ported 9 shell/navigation components (9 files) as React/Tailwind/CVA:
  - `MnCommandPalette` — fuzzy search, Cmd+K hotkey, keyboard nav, portal overlay
  - `MnHeaderShell` — config-driven app header with actions and filter groups
  - `MnSectionNav` — page-level nav with active highlighting and prev/next
  - `MnThemeToggle` — cycle button integrating with ThemeProvider
  - `MnThemeRotary` — rotary dial for theme selection with animation
  - `MnAsyncSelect` — debounced async search with ARIA combobox pattern
  - `MnDatePicker` — calendar grid with keyboard nav, locale-aware
  - `MnProfile` — avatar dropdown with sections, badge, keyboard nav
  - `MnA11y` — accessibility FAB with font/spacing scaling, reduced motion
- All integrate with existing ThemeProvider and --mn-* token system
- 1,915 LOC total, all files under 250-line limit

### W3: Maranello Design System Migration — Wave 3: Data-Heavy Components

- Ported 7 data-heavy components (7 files) as React/Tailwind/CVA:
  - `MnDataTable` — sortable, filterable, groupable, paginated data grid with ARIA
  - `MnDetailPanel` — slide-out panel with view/edit modes and field renderers
  - `MnEntityWorkbench` — multi-tab entity editor with dirty state tracking
  - `MnFacetWorkbench` — facet/filter panel with checkbox/radio selection
  - `MnChat` — streaming chat bubbles, code blocks, quick actions, voice input
  - `MnOkr` — objectives and key results with progress bars and status
  - `MnSystemStatus` — service health dashboard with polling and incidents
- 1,568 LOC total, all files under 250-line limit

### Maranello Design System Migration — Wave 4: Canvas & Visual Components

- Ported 10 canvas/visual components (10 files) as React/Tailwind/CVA:
  - `MnChart` — 6 chart types (sparkline, donut, area, bar, radar, bubble) via Canvas 2D
  - `MnGauge` — Ferrari-style animated canvas gauge with color zones and complications
  - `MnSpeedometer` — animated canvas speedometer with tick marks
  - `MnFunnel` — SVG funnel with conversion rates and exit tracking
  - `MnHbar` — DOM horizontal bar chart with animation
  - `MnGantt` — timeline with task bars, dependencies, milestones, today marker
  - `MnKanbanBoard` — drag & drop board with HTML5 DnD API
  - `MnMap` — canvas world map with zoom/pan and markers
  - `MnMapbox` — Mapbox GL JS wrapper with dynamic import fallback
  - `MnFerrariControl` — manettino rotary, cruise lever, toggle lever, stepped rotary
- All canvas components use ResizeObserver for responsive sizing
- 2,176 LOC total, all files under 250-line limit (except mn-mapbox at 254)

### W4: Runtime source of truth

- Changed: app metadata, nav, themes, AI registry, and dashboard page config now load from `convergio.yaml` via `src/lib/config-loader.ts`
- Changed: `src/config/app.ts`, `navigation.ts`, `ai.config.ts`, `pages/dashboard.config.ts` are now deprecated re-exports
- Added: `src/lib/icon-map.ts` — maps Lucide icon name strings to components at runtime
- Changed: `NavItem.icon` type from `LucideIcon` to `iconName: string` (resolved client-side)
- Added: `vitest.config.ts` for kernel gate compatibility
- Learnings: kernel evidence gate runs `npx vitest run` — projects without Vitest need a config with `passWithNoTests: true`

### Maranello Design System Migration — Wave 5: Integration

- Wired 11 Maranello block types into page-renderer system
- Added block type interfaces to src/types/config.ts (gauge, chart, gantt, kanban, funnel, hbar, speedometer, map, okr, system-status, data-table-maranello)
- Added example Maranello blocks to convergio.yaml dashboard page
- Created comprehensive component showcase at /preview with all 36 components
- Updated README.md with full Maranello Design System component catalog

### W5: Starter baseline neutralization

- Changed: activity feed, agent table, and notifications now use generic internal-tools copy
- Removed: all Plan 10035, alfa-01, Thor, ws-44bf, header-shell-followups references
- Changed: convergio.yaml seeded data uses generic deployment/worker examples

### TF: Maranello Design System Migration — Closure

- Full validation: typecheck ✓, build ✓, lint clean (0 new errors)
- Fixed lint issues: unconditional hooks (modal), ref-in-render (tabs), empty interface (a11y), mutable-in-render (gantt)
- 36 Web Components successfully migrated to React/Tailwind/CVA
- Total: ~10,000+ LOC across 36 component files + barrel + showcase + types
- All components use --mn-* CSS tokens for multi-theme support (navy, light, dark, colorblind)
- No new npm dependencies added — all implementations are self-contained

### W6: Server-first data path

- Changed: `src/lib/env.ts` validates API_URL with sensible default
- Changed: `src/lib/api/client.ts` uses validated env for baseUrl
- Changed: `src/lib/actions/profile.ts` wired to real API call with graceful fallback
- Changed: `src/app/(dashboard)/settings/page.tsx` uses `useActionState` for form submission
- Changed: `src/app/api/health/route.ts` includes version from package.json
- Pattern: server actions catch network errors gracefully for starter mode (no backend)

### W7: AI routing hardening

- Changed: `src/app/api/chat/route.ts` uses `resolveModel()` with provider switching (openai/anthropic/custom)
- Added: exhaustive compile-time provider check prevents silent fallback
- Added: anthropic and custom providers return 501 with setup guidance

### W8: Auth boundary wiring

- Changed: `src/proxy.ts` now enforces session cookie check on protected routes
- Changed: `src/app/(auth)/login/page.tsx` wired with server action (demo: admin/admin)
- Added: logout server action + sign-out button in dashboard layout
- Changed: `e2e/shell.spec.ts` injects session cookie for test bypass

### W9: Starter productization

- Changed: README.md fully rewritten to match actual starter state (155 lines)
- Fixed: Next.js version 15 → 16 in docs
- Added: convergio.yaml, server-first data, auth boundary, AI routing sections to README
- Kept: Tauri section clearly marked as optional

### TF: Closure

- Fixed: E2E tests now include auth cookie in all spec files (themes, zero-errors)
- Validated: 38/38 E2E pass, typecheck clean, build clean
- Added: MPL-2.0 license file
- Pushed: repo live at https://github.com/Roberdan/convergio-frontend
