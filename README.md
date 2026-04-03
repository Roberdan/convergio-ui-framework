# Convergio Frontend

Operational shell and component showcase powered by the **Maranello Design System** — 100+ React components, 4 themes, config-driven architecture. Built on Next.js 16 App Router, shadcn/ui, Tailwind CSS v4.

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript strict
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # Playwright E2E
```

Web dev works standalone — no backend required. If a ConvergioPlatform daemon is running on `:8420`, pages will show live data; otherwise they render gracefully with static/demo data.

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 App Router |
| UI Primitives | shadcn/ui + Base UI + Tailwind CSS v4 |
| Design System | Maranello — 100 components with `Mn` prefix |
| Typography | Outfit (headings), Inter (body), Barlow Condensed (mono/data) |
| Themes | 4: Navy, Dark, Light, Colorblind (WCAG 2.2 AA) |
| Icons | Lucide (no emoji — CONSTITUTION P2) |
| AI | Vercel AI SDK v6 (`ai@^6`, `@ai-sdk/react@^3`) — OpenAI provider |
| Desktop | Tauri (optional, `src-tauri/`) |

## convergio.yaml — config-driven architecture

The app reads `convergio.yaml` at startup for branding, navigation, pages, and AI agents. Edit this file and restart the dev server to customize without touching source code.

```yaml
app:
  name: Convergio
  description: Operational product shell

theme:
  default: navy            # light | dark | navy | colorblind

ai:
  defaultAgent: jervis
  agents:
    - id: jervis
      provider: openai     # only openai is wired; anthropic/custom return 501
      model: gpt-4o
      apiRoute: /api/chat

navigation:
  sections:
    - label: Overview
      items:
        - id: dashboard
          label: Dashboard
          href: /dashboard
          icon: LayoutDashboard
```

**What the config drives:** `app` (branding), `theme` (default theme), `ai` (chat agents), `navigation` (sidebar), `pages` (dashboard block layout).

**What the config does NOT drive:** API base URL (use `API_URL` env var), theme storage key (hardcoded in `theme-script.tsx`).

`src/lib/config-loader.ts` reads the YAML, validates with Zod, and caches. Override path with `CONVERGIO_CONFIG_PATH` env var.

## Architecture

```
convergio.yaml              # config: branding, nav, pages, AI agents
src/
  app/
    (auth)/login/           # auth boundary (demo: admin / admin)
    (dashboard)/            # protected shell — layout checks session cookie
      dashboard/            # main dashboard (block grid from convergio.yaml)
      showcase/             # component showcase (all Maranello components)
      agents/ mesh/ …       # feature pages wired to ConvergioPlatform APIs
    api/
      chat/route.ts         # AI streaming (Vercel AI SDK v6)
      health/route.ts       # liveness probe
    layout.tsx              # root: fonts, theme script, CanvasSafeArc
  components/
    a2ui/                   # A2UI protocol: SSE block renderer
    blocks/                 # page blocks: kpi-card, data-table, ai-chat-panel
    maranello/              # Maranello Design System — 100 components (see below)
    page-renderer.tsx       # renders convergio.yaml pages → block grid
    shell/                  # sidebar, header, command-menu
    theme/                  # theme-provider, theme-switcher, theme-script
    ui/                     # shadcn/ui source components
  hooks/
    useApiQuery.ts          # generic SWR-like API poller
    useEventSource.ts       # SSE event stream hook
  lib/
    api/                    # typed API clients for ConvergioPlatform daemon
    config-loader.ts        # YAML parser + Zod validation (cached)
    canvas-safe-arc.tsx     # global arc radius clamp (prevents canvas crashes)
    env.ts                  # typed env vars (API_URL, SESSION_SECRET)
    session.ts              # HMAC-signed session cookie utilities
  types/                    # shared TypeScript interfaces
src-tauri/                  # optional Tauri desktop scaffold
```

## Auth

The login page uses demo credentials (`admin` / `admin` unless `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars are set). On success, an HMAC-signed `httpOnly` session cookie is set. All `(dashboard)` routes check this cookie.

To integrate real auth: swap the credential check, replace the cookie logic with your IdP, and protect API routes.

## Themes

Switch via header dropdown, command palette (Cmd-K), or the rotary dial.

| Theme | Background | Accent | Use case |
|---|---|---|---|
| Navy | Deep blue `#0d2045` | Gold `#FFC72C` | Default — Maranello signature |
| Dark | Near-black `#111111` | Gold `#FFC72C` | High contrast dark |
| Light | Warm ivory `#FAF3E6` | Red `#DC0000` | Light/warm (Avorio) |
| Colorblind | Dark `#111111` | Blue `#0072B2` | Okabe-Ito safe palette |

All themes use `--mn-*` CSS custom properties defined in `globals.css`. All pass WCAG 2.2 AA. See `docs/guides/adding-a-theme.md` for adding a 5th theme.

## Maranello Design System

100 React components in `src/components/maranello/`, all following the `Mn` prefix convention. Built with CVA (class-variance-authority) + Tailwind CSS v4 + `--mn-*` theme tokens. All support 4 themes and WCAG 2.2 AA accessibility.

```tsx
import { MnBadge, MnChart, MnDataTable, MnGauge } from "@/components/maranello"
```

Browse the live showcase at `/showcase`.

### Component catalog (100 components)

**Data Visualization** — chart, gauge, half-gauge, heatmap, funnel, waterfall, speedometer, confidence-chart, bullet-chart, hbar, pipeline-ranking, cost-timeline, cohort-grid, budget-treemap

**Data Display** — data-table, user-table, kpi-scorecard, flip-counter, progress-ring, token-meter, source-cards, detail-panel, badge, avatar, icon, spinner

**Navigation** — breadcrumb, tabs, stepper, section-nav, command-palette

**Forms & Input** — form-field, async-select, search-drawer, date-picker, date-range-picker, calendar-range, filter-panel, toggle-switch, voice-input, login, profile

**Feedback** — toast, state-scaffold, modal, notification-center, streaming-text, activity-feed

**Layout** — grid-layout, section-card, admin-shell, settings-panel, dashboard, dashboard-strip, dashboard-renderer, header-shell

**Strategy** — bcg-matrix, nine-box-matrix, risk-matrix, decision-matrix, swot, porter-five-forces, business-model-canvas, strategy-canvas, okr, customer-journey, customer-journey-map

**Financial** — finops, agent-cost-breakdown

**Agentic / AI** — agent-trace, approval-chain, neural-nodes, augmented-brain, hub-spoke, active-missions, chat

**Network & System** — mesh-network, mesh-network-card, mesh-network-canvas, mesh-network-toolbar, network-messages, system-status, deployment-table, social-graph, org-chart, map

**Operations** — binnacle, instrument-binnacle, night-jobs, audit-log, gantt, kanban-board, entity-workbench, facet-workbench

**Theme Controls** — theme-toggle, theme-rotary, ferrari-control, a11y, a11y-fab, dropdown-menu

### Key patterns

- **CVA + cn()** for variant styling
- **`"use client"`** only where hooks are used
- **Named exports** only (no default exports)
- **CSS custom properties** (`--mn-*`) for all colors — never hardcoded
- **Canvas components** use `ResizeObserver` + dimension guards + `CanvasSafeArc`
- **Hydration-safe formatting** via `mn-format.ts` (no `toLocaleString`)
- **Max 250 lines per file** — logic extracted to `.helpers.ts` siblings

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `API_URL` | `http://localhost:8420` | Backend API URL (server-side) |
| `NEXT_PUBLIC_API_URL` | — | Client-side API URL (optional, falls back to `API_URL`) |
| `SESSION_SECRET` | `convergio-dev-secret` | HMAC signing secret for session cookies |
| `CONVERGIO_CONFIG_PATH` | `./convergio.yaml` | Override config file path |
| `NEXT_PUBLIC_APP_NAME` | `Convergio` | App display name in branding |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint check |
| `pnpm typecheck` | TypeScript strict check |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm tauri:dev` | Desktop dev (requires Rust + Tauri) |
| `pnpm tauri:build` | Desktop build (requires Rust + Tauri) |

## Tauri (optional)

Desktop packaging via Tauri. Config in `src-tauri/tauri.conf.json`. Web dev does **not** require Rust or Tauri.

**Note:** The current Tauri config expects a static export (`../out`) but the Next.js build produces a server-rendered app. To use Tauri, either switch to `output: 'export'` in `next.config.ts` (losing server actions and API routes) or adopt Tauri's server-side rendering mode.

## Design Principles (CONSTITUTION.md)

- **WCAG 2.2 AA** minimum accessibility
- **4 themes always** — every component works in navy, dark, light, colorblind
- **Keyboard-first** — Cmd-K, Tab navigation, focus rings
- **Lucide icons only** — zero emoji
- **Max 250 lines per file** — split into component + `.helpers.ts`
- **shadcn source-first** — UI components live in your repo
- **TypeScript strict** — no `any`, named exports only

## License

MPL-2.0
