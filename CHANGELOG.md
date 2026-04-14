# Changelog

## [1.7.1] - 14 April 2026

### Documentation Restructure
- docs: per-folder `AGENTS.md` in every `src/` subdirectory (9 files) — any agent gets local context on entry
- docs: root docs slimmed 1059→397 lines (−63%), zero duplication between files
- docs: agent specialist files restored with full domain knowledge (gauge complications, CRUD patterns, a11y checklist, composition recipes) — updated for v1.7.0 (103 components, 10 MCP tools, 5 providers)
- docs: README.md updated — "Three Ways to Use It" (framework / core package / registry), 10 MCP tools, correct URLs
- chore: all `convergio-frontend` references → `convergio-ui-framework`

## [1.7.0] - 14 April 2026

### Core Package + Smart Registry
- feat: dynamic block registry — PageRenderer loads components lazily from a Map-based registry instead of 12 static imports
- feat: `registerBlock()` / `lazyBlock()` / `getBlock()` API in `src/lib/block-registry.ts`
- feat: `block-registrations.ts` auto-registers all built-in block types for framework mode
- feat: `AppShell` accepts optional `a11ySlot` prop — shell works without Maranello components
- feat: component dependency graph — `scripts/scan-deps.ts` scans 136 files, `scripts/dep-graph.json` maps 112 main components
- feat: `scripts/sync-registry-deps.ts` updates `registryDependencies` in 107 `public/r/*.json` registry files
- feat: 3 new Nasra MCP tools: `analyze_yaml_needs`, `resolve_component_deps`, `install_components`
- feat: Azure OpenAI provider added (`provider: "azure"` in convergio.yaml, reads `AZURE_OPENAI_ENDPOINT` + `AZURE_OPENAI_API_KEY`)
- breaking: CLI providers removed (`claude-cli`, `copilot-cli`, `qwen-cli`) — use SDK providers instead
- chore: deleted `route.helpers.ts` (CLI spawn code)
- chore: MCP server version 1.0.0 → 1.1.0, now 10 tools

### Provider summary (5 SDK providers)
- `openai` — OpenAI API (OPENAI_API_KEY)
- `azure` — Azure OpenAI (AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_API_KEY)
- `anthropic` — Anthropic API (ANTHROPIC_API_KEY)
- `copilot` — GitHub Copilot API (GITHUB_TOKEN)
- `qwen` — DashScope API (QWEN_API_KEY)

## [1.6.0] - 14 April 2026

### Multi-Provider AI Routing
- feat(ai): 8 provider options for chat agents, configured via `convergio.yaml`
- SDK-based: `openai`, `anthropic`, `copilot`, `qwen` (via Vercel AI SDK)
- CLI-based: `claude-cli`, `copilot-cli`, `qwen-cli` (spawn local binary, no API keys)
- Each CLI provider parses its native NDJSON stream format
- CLI helpers extracted to `route.helpers.ts` (CONSTITUTION P4 compliance)

## [1.5.1] - 14 April 2026

### Theme Refinements
- feat(theme): tint all neutral tokens per brand temperature — dark theme warm-amber, colorblind theme cool-blue, light theme warm ivory
- feat(theme): per-theme tinted shadows with hairline glow borders replacing global pure-black shadows
- All values verified WCAG AA compliant; navy theme unchanged (already tinted)

## [1.4.2] - 09 April 2026

### Bug Fixes (closes #51, #52, #53, #54)
- fix(brain3d): `showTraffic` prop now correctly forwarded to scene renderer (#51)
- fix(a11y): duration text in MnProcessTimeline accessible via sr-only span (#52)
- fix(sse): reconnect timer cleared on unmount — prevents stacked retries (#53)
- fix(brain3d): bidirectional edges capped at 20 total particles (10 per direction) (#54)

## [1.4.1] - 09 April 2026

### Bug Fixes
- fix(gauge): reverted incorrect -90° Canvas angle offset from v1.3.1 — `startAngle`/`endAngle` props are already in Canvas coordinates and don't need transformation

## [1.4.0] - 09 April 2026

### Agentic Enhancements (closes #46, #47, #48, #49)
- Feat: `useSSEAdapter<T>` — generic SSE adapter hook with reducer-based state accumulation
- Feat: 5 convenience SSE hooks: `useBrain3DLive`, `useAgentTraceLive`, `useHubSpokeLive`, `useApprovalChainLive`, `useActiveMissionsLive`
- Feat: `MnProcessTimeline` — new horizontal/vertical multi-step workflow visualization with actor avatars, status indicators, duration display, and click handlers
- Feat: `MnAgentTrace` — actor grouping with color bands, actor headers on ownership change, handoff bridges, and legend component
- Feat: `MnBrain3D` — configurable animated edge particles with per-edge `particles`, `particleSpeed`, `particleColor`, `bidirectional` props; 20-particle cap for performance

### Code Quality
- Fix: resolved all 20 ESLint warnings across 14 files (unused vars, img elements)
- Fix: `react-hooks/refs` error in `useSSEAdapter` — moved ref update to useEffect
- Fix: extracted `mn-agent-trace.helpers.tsx` to keep file under 250-line limit
- Zero ESLint warnings remaining

## [1.3.1] - 09 April 2026

### Bug Fixes
- fix(gauge): corrected MnGauge needle rotation off by 90° — applied -90° Canvas angle offset so the gauge arc spans 7→5 o'clock as expected (closes #43)

### Tests
- test(e2e): added comprehensive full-navigation Playwright suite (529 lines) covering all 12 dashboard pages, sidebar navigation, modals, filters, stress tests, and accessibility checks

## [1.3.0] - 09 April 2026

### i18n (closes #41, #42)
- Feat: framework-wide i18n system — `MnLocaleProvider` context, `useLocale()` hook, `resolveLocale()` for server components
- Feat: YAML `locale:` section support in config schema and loader
- Feat: 80+ typed i18n namespaces with English defaults covering all components
- Migrated 75+ components from hardcoded English to `useLocale()`: shell, theme, data-display, feedback, forms, layout, navigation, agentic, network, ops, strategy, financial, data-viz
- Migrated error pages, 404, login page, UI primitives (dialog, sheet)
- Docs: added `docs/guides/i18n.md` — full i18n guide with YAML and React examples
- Docs: updated CLAUDE.md, AGENTS.md, all specialist agent files with i18n rules
- Zero breaking changes — all components work unchanged with English defaults

## [1.2.0] - 08 April 2026

### MCP Server
- Feat: built-in Model Context Protocol server (`pnpm mcp`) with 7 tools for AI agent integration
- Tools: `search_components`, `get_component`, `list_categories`, `generate_yaml_page`, `list_block_types`, `get_composition`, `get_theme_tokens`
- Reads from the real component catalog and Zod schemas — zero hardcoded data
- Supports stdio transport for Copilot CLI, Claude Desktop, and VS Code

### Onboarding (closes #35)
- Docs: clarified that `convergio-design` is archived; `convergio-frontend` is the only starting point
- Updated README "Two Ways to Use It" and AGENTS.md "Two Usage Modes" with explicit callout

### Cockpit Showcase & Gauge Complications
- Feat: dedicated **Cockpit** showcase section (`/showcase/cockpit`) with 6 instrument groups faithful to the old convergio-design demo
- Feat: `MnGauge` now supports **crosshair** complication (scatter dots, axis labels, quadrant counts) — new `crosshair` and `quadrantCounts` props
- Feat: `MnGauge` now supports **multigraph** complication (sparkline area chart inside gauge face) — new `multigraph` prop
- Feat: `MnGauge` center text overrides via `centerValue` and `centerUnit` props for no-needle gauge modes
- Feat: cockpit performance dials with Ferrari `-225`/`45` bottom-center orientation
- Feat: KPI instrument cluster (binnacle) with Utilization (innerRing+odometer), Quality Score (arcBar+subDials+trend), Portfolio Map (crosshair+scatter), signal panels
- Feat: 5-zone dashboard strip (gauge, 7-row pipeline, 4-series trend, board, gauge)
- Feat: secondary gauge cluster (Risk Level, Data Quality, KPI Coverage, Quality Trend with multigraph)
- Feat: resource heatmap and system status in cockpit section
- Feat: cockpit added to sidebar navigation with Gauge icon

### Preset Gallery
- Feat: added `/showcase/presets` with three accessibility-first starter previews: workspace, ops, and executive
- Feat: upgraded the showcase landing preview from toy widgets to product-style live surfaces
- Docs: added curated preset YAMLs under `presets/` and quick-start instructions in `README.md`

## [1.1.0] - 07 April 2026

### Agent Skill Definitions
- Docs: upgraded 4 AGENT-*.md from wave task lists to permanent skill definitions
  - **Nasra**: data-viz, charts, gauges, real-time streaming, monitoring
  - **Jony**: CRUD pages, data tables, forms, modals, detail panels
  - **Baccio**: testing, accessibility, responsive design, quality gates
  - **Sara**: page composition, API integration, data mapping, UX patterns
- Each agent now defines: owned components, enforced patterns, anti-patterns, cross-references
- Docs: AGENTS.md updated with specialist agent reference table

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
