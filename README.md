# Convergio Frontend

A **config-driven dashboard framework** with 101 React components, 4 themes, and a shadcn-compatible registry. Write YAML, get a full working app — sidebar, themes, AI chat, data visualizations — with zero custom code.

**Maranello** is the design system inside Convergio. The framework ships everything: layout shell, theme engine, config loader, page renderer, component showcase, and optional AI/desktop layers.

## Two Ways to Use It

### 1. Framework Mode — Clone and Configure (Recommended)

Clone this repo, edit one YAML file, and you have a production-ready dashboard app. No React code required for basic dashboards.

```bash
git clone https://github.com/Roberdan/convergio-frontend.git my-app
cd my-app
pnpm install
```

Edit `maranello.yaml` (or `convergio.yaml`) in the project root:

```yaml
app:
  name: Acme Dashboard
  logo: /logo.svg

theme:
  default: dark

navigation:
  sections:
    - label: Main
      items:
        - { id: home, label: Home, href: /, icon: LayoutDashboard }
        - { id: team, label: Team, href: /team, icon: Users }

pages:
  /:
    title: Home
    rows:
      - columns: 3
        blocks:
          - { type: kpi-card, label: Revenue, value: "$1.2M", change: "+8%", trend: up }
          - { type: kpi-card, label: Users, value: "34,521", change: "+12%", trend: up }
          - { type: kpi-card, label: Uptime, value: "99.97%", trend: flat }
      - columns: 2
        blocks:
          - type: chart-block
            chartType: area
            labels: [Jan, Feb, Mar, Apr, May, Jun]
            series:
              - { label: Revenue, data: [80, 95, 110, 108, 130, 142] }
          - type: gauge-block
            label: CPU Load
            value: 73
            min: 0
            max: 100
            unit: "%"
            size: md
  /team:
    title: Team
    rows:
      - columns: 1
        blocks:
          - type: data-table-maranello
            columns: [{ accessorKey: name, header: Name }, { accessorKey: role, header: Role }]
            data:
              - { name: Alice, role: Engineer }
              - { name: Bob, role: Designer }
```

```bash
pnpm dev    # open http://localhost:3000 — your dashboard is live
```

**What you get out of the box:**
- Responsive sidebar navigation (auto-generated from YAML)
- 4 themes with one-click switching (header dropdown, Cmd-K palette, or Manettino dial)
- WCAG 2.2 AA accessibility with floating a11y toolbar
- Command palette (Cmd-K) with fuzzy search across all components
- Config-driven pages — add new routes by adding entries to `pages:` in YAML
- Optional AI chat panel, SSE event streams, API polling hooks

**What you add when you need it:**
- Custom React pages in `src/app/(dashboard)/your-page/page.tsx`
- Custom components in `src/components/maranello/your-category/`
- API backend connection via `API_URL` env var + `use-api-query` / `use-event-source` hooks

### 2. Registry Mode — Cherry-Pick Components

Already have a Next.js/React project? Install individual Maranello components via the shadcn CLI:

```bash
npx shadcn add mn-badge --registry https://your-maranello-host/r
npx shadcn add mn-gauge mn-chart mn-data-table --registry https://your-maranello-host/r
```

Browse the full registry at `/r/index.json`. Each component JSON includes source code, npm dependencies, and registry dependencies. See `docs/guides/using-the-registry.md` for setup instructions.

> **Note:** Registry mode gives you individual components. Framework mode gives you the complete app shell, config engine, theme system, and all 101 components working together.

---

## How It Works

```
maranello.yaml ──> config-loader.ts ──> Zod validation ──> page-renderer.tsx ──> UI
                   (reads YAML,          (config-schema.ts    (maps block types
                    caches result,        validates structure)  to React components)
                    watches for changes)
```

1. **You write YAML** — branding, navigation, pages with block layouts, optional AI agents
2. **Config loader** (`src/lib/config-loader.ts`) parses and validates with Zod, caches the result, and watches for changes in dev mode
3. **Layout shell** (`src/components/shell/`) reads `app` + `navigation` from config and renders sidebar, header, breadcrumbs
4. **Page renderer** (`src/components/page-renderer.tsx`) reads `pages` config and maps each block `type` to its React component
5. **Theme engine** applies `--mn-*` CSS custom properties based on `data-theme` attribute on `<html>`

Config file resolution (first match wins):
1. `$MARANELLO_CONFIG_PATH` env var
2. `$CONVERGIO_CONFIG_PATH` env var
3. `./maranello.yaml` in project root
4. `./convergio.yaml` in project root

If no config file is found, the framework renders sensible defaults (app name "Maranello", navy theme, empty navigation).

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 App Router |
| UI Primitives | shadcn/ui + Base UI + Tailwind CSS v4 |
| Design System | Maranello — 101 components with `Mn` prefix |
| Typography | Outfit (headings), Inter (body), Barlow Condensed (mono/data) |
| Themes | 4: Navy, Dark, Light, Colorblind (WCAG 2.2 AA) |
| Icons | Lucide only (no emoji — CONSTITUTION P2) |
| AI | Vercel AI SDK v6 (optional — not required for design system) |
| Desktop | Tauri (optional, `src-tauri/`) |

## Scripts

```bash
pnpm dev          # start dev server at http://localhost:3000
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript strict
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # Playwright E2E
pnpm format       # Prettier
```

---

## Full YAML Reference

```yaml
# ── App Identity ──
app:
  name: "My App"                      # required — displayed in header/title
  description: "My app description"   # optional
  logo: "/logo.svg"                   # optional — path to logo asset

# ── Theme ──
theme:
  default: navy                       # light | dark | navy | colorblind
  storageKey: my-theme                # optional — localStorage key for persistence

# ── API Connection (optional) ──
api:
  baseUrl: http://localhost:8420      # backend API URL (must be valid URL)

# ── AI Agents (optional) ──
ai:
  defaultAgent: jervis                # id of the default agent
  agents:
    - id: jervis                      # unique identifier
      name: Jervis                    # display name
      description: "Platform AI"      # description
      provider: openai                # LLM provider
      model: gpt-4o                   # model name
      systemPrompt: |                 # system prompt for the agent
        You are Jervis, a helpful assistant.
      apiRoute: /api/chat             # optional — API endpoint
      avatar: J                       # optional — avatar character
      maxTokens: 2048                 # optional — max response tokens

# ── Navigation ──
# Defines sidebar navigation. Each section has a label and a list of items.
# Icons must be valid Lucide icon names registered in src/lib/icon-map.ts.
navigation:
  sections:
    - label: Overview
      items:
        - id: dashboard
          label: Dashboard
          href: /dashboard
          icon: LayoutDashboard
          badge: 3                    # optional — numeric badge

        - id: settings
          label: Settings
          href: /settings
          icon: Settings

# ── Pages ──
# Config-driven dashboard pages. Each route maps to a page with rows of blocks.
# The page-renderer reads this config and renders the appropriate block components.
pages:
  /:                                  # route path
    title: Dashboard                  # page title (required)
    description: "Overview"           # optional
    rows:
      - columns: 4                    # number of grid columns (1-12)
        blocks:
          - type: kpi-card            # block type (see list below)
            label: Active Users
            value: "1,234"
            change: "+12%"
            trend: up                 # up | down | flat

      - columns: 2
        blocks:
          - type: gauge-block
            value: 73
            min: 0
            max: 100
            unit: "%"
            label: CPU Load
            animate: true
            size: md                  # sm | md | lg | fluid

          - type: chart-block
            chartType: bar            # sparkline | donut | area | bar | radar | bubble
            labels: [Mon, Tue, Wed]
            series:
              - label: Visits
                data: [100, 200, 150]
            showLegend: true
            animate: true

      - columns: 1
        blocks:
          - type: ai-chat
            agentId: jervis           # optional — references ai.agents[].id
```

### Available Block Types

| Block Type | Description | Key Props |
|---|---|---|
| `kpi-card` | Metric card with trend | `label`, `value`, `change`, `trend` |
| `data-table` | Simple table | `columns[]`, `rows[]` |
| `data-table-maranello` | Rich data table | `columns[]`, `data[]` |
| `activity-feed` | Timeline of events | `items[]{time, text, status}` |
| `stat-list` | Key-value stat list | `items[]{label, value, status}` |
| `empty-state` | Placeholder | `title`, `description`, `actionLabel`, `actionHref` |
| `ai-chat` | AI chat panel | `agentId` |
| `gauge-block` | Radial gauge | `value`, `min`, `max`, `unit`, `label`, `size` |
| `chart-block` | Chart (6 types) | `chartType`, `series[]`, `labels[]`, `segments[]`, `points[]`, `radarData[]` |
| `funnel-block` | Sales/conversion funnel | `data{pipeline[], total}`, `size` |
| `hbar-block` | Horizontal bar chart | `bars[]{label, value, color}` |
| `speedometer-block` | Speedometer dial | `value`, `min`, `max` |
| `gantt-block` | Gantt timeline | `tasks[]` |
| `kanban-block` | Kanban board | `columns[]`, `cards[]` |
| `okr-block` | OKR tracker | `objectives[]` |
| `map-block` | Geographic map | (passthrough) |
| `system-status-block` | Service status panel | `services[]{id, name, status}`, `incidents[]` |

---

## Architecture

```
maranello.yaml              # config: branding, nav, pages, AI agents
public/r/                   # shadcn-compatible component registry
src/
  app/
    (dashboard)/            # shell — layout with sidebar + header
      agents/               #   built-in page: agent management
      billing/              #   built-in page: billing/costs
      inference/            #   built-in page: inference monitoring
      mesh/                 #   built-in page: mesh network
      metrics/              #   built-in page: live metrics
      night-agents/         #   built-in page: night agents dashboard
      observatory/          #   built-in page: event observatory
      orgs/                 #   built-in page: organizations
      plans/                #   built-in page: plan management
      prompts/              #   built-in page: prompt studio
      settings/             #   built-in page: settings
      showcase/             #   component showcase (12 categories + icons + themes)
      [...slug]/            #   catch-all for YAML-defined pages
    api/
      chat/route.ts         # AI streaming endpoint (optional)
      health/route.ts       # liveness probe
    globals.css             # theme tokens: --mn-* + shadcn bridge vars
    layout.tsx              # root: fonts, theme script, CanvasSafeArc
  components/
    maranello/              # Maranello Design System — 101 components
      agentic/              #   7 AI/agent components
      data-display/         #  12 data display components
      data-viz/             #  14 data visualization components
      feedback/             #   6 feedback components
      financial/            #   2 financial components
      forms/                #  11 form/input components
      layout/               #   8 layout components
      navigation/           #   5 navigation components
      network/              #  10 network/system components
      ops/                  #   8 operations components
      strategy/             #  11 strategy components
      theme/                #   6 theme control + accessibility components
      shared/               #   shared utilities + tests
      index.ts              #   barrel re-export (all 101 components)
    blocks/                 # page blocks — renders config → UI
    page-renderer.tsx       # renders config pages → block grid
    shell/                  # sidebar, header, command-menu (Cmd-K)
    theme/                  # theme-provider, theme-switcher, theme-script
    ui/                     # shadcn/ui source components
  hooks/
    use-api-query.ts        # generic SWR-like API poller (pollInterval, error handling)
    use-event-source.ts     # SSE event stream hook (auto-reconnect, exponential backoff)
  lib/
    config-loader.ts        # YAML parser + Zod validation (cached, file-watched in dev)
    config-schema.ts        # Zod schema for config file
    config-block-schemas.ts # Zod schemas for each block type
    component-catalog.ts    # 101-entry catalog with bilingual search
    env.ts                  # environment variable resolution
    icon-map.ts             # Lucide icon name → component resolver
    icon-slot.tsx           # <IconSlot name="..." /> for dynamic icons
    utils.ts                # cn() helper (clsx + tailwind-merge)
  types/                    # shared TypeScript interfaces
src-tauri/                  # optional Tauri desktop scaffold
docs/
  guides/                   # how-to guides (see Documentation section)
  components/               # per-component MDX docs (101 files)
  adr/                      # architecture decision records
```

### Adding Custom Pages

For pages that go beyond YAML blocks, create a standard Next.js page:

```
src/app/(dashboard)/your-page/page.tsx
```

It automatically gets the sidebar, header, breadcrumbs, and theme — the `(dashboard)` layout wraps everything. Use any Maranello component:

```tsx
import { MnChart, MnDataTable, MnBadge } from "@/components/maranello";

export default function YourPage() {
  return (
    <div className="space-y-6">
      <h1>Your Page</h1>
      <MnChart type="area" series={[...]} labels={[...]} />
    </div>
  );
}
```

Then add the navigation entry in YAML:

```yaml
navigation:
  sections:
    - label: Main
      items:
        - { id: your-page, label: Your Page, href: /your-page, icon: Sparkles }
```

## Showcase

The built-in showcase at `/showcase` demonstrates all 101 components with live interactive demos:

- **Landing** (`/showcase`) — category cards with component counts + live previews
- **Category pages** (`/showcase/[category]`) — live demos with inline documentation (description, when to use, props table, code examples)
- **Icons browser** (`/showcase/icons`) — searchable grid of all Lucide icons with click-to-copy
- **Theme playground** (`/showcase/themes`) — side-by-side comparison across all 4 themes

### Command Palette (Cmd-K)

Press `Cmd+K` (or `Ctrl+K`) to open the command palette:
- **Fuzzy search** across all 101 components (bilingual IT/EN keywords)
- **Category navigation** — jump to any showcase section
- **Theme switching** — switch between all 4 themes

## Component Registry

The `public/r/` directory contains a shadcn-compatible component registry:

```
public/r/
  index.json              # full catalog with metadata for all 101 components
  mn-badge.json           # individual component (source + dependencies)
  mn-gauge.json
  ...
```

Each component JSON includes:
- **Source code** — the actual `.tsx` file, ready to paste into your project
- **npm dependencies** — packages required (e.g., `recharts`, `lucide-react`)
- **Registry dependencies** — other Maranello components or shared utilities needed

See `docs/guides/using-the-registry.md` for full installation instructions.

## Themes

Switch via header dropdown, command palette (Cmd-K), or the Manettino rotary dial.

| Theme | Background | Accent | Use case |
|---|---|---|---|
| Navy | Deep blue `#0d2045` | Gold `#FFC72C` | Default — Maranello signature |
| Dark | Near-black `#111111` | Gold `#FFC72C` | High contrast dark |
| Light | Warm ivory `#FAF3E6` | Red `#DC0000` | Light/warm (Avorio) |
| Colorblind | Dark `#111111` | Blue `#0072B2` | Okabe-Ito safe palette |

All themes use `--mn-*` CSS custom properties defined in `globals.css`. All pass WCAG 2.2 AA. See `docs/guides/adding-a-theme.md` for adding a 5th theme.

### Accessibility (A11y)

Built-in `MnA11yFab` floating toolbar gives users runtime control over:
- **Font size** — S / M / L / XL
- **Line spacing** — 1x / 1.5x / 2x
- **Dyslexia font** — toggles OpenDyslexic
- **Reduced motion** — disables animations
- **High contrast** — increases contrast ratios
- **Focus indicators** — toggle visible focus rings

---

## Component Catalog (101 components)

```tsx
import { MnBadge, MnChart, MnDataTable, MnGauge } from "@/components/maranello"
```

| Category | Count | Components |
|---|---|---|
| Data Visualization | 14 | chart, gauge, half-gauge, heatmap, funnel, waterfall, speedometer, confidence-chart, bullet-chart, hbar, pipeline-ranking, cost-timeline, cohort-grid, budget-treemap |
| Data Display | 12 | data-table, user-table, kpi-scorecard, flip-counter, progress-ring, token-meter, source-cards, detail-panel, badge, avatar, icon, spinner |
| Forms & Input | 11 | form-field, async-select, search-drawer, date-picker, date-range-picker, calendar-range, filter-panel, toggle-switch, voice-input, login, profile |
| Strategy | 11 | bcg-matrix, nine-box-matrix, risk-matrix, decision-matrix, swot, porter-five-forces, business-model-canvas, strategy-canvas, okr, customer-journey, customer-journey-map |
| Network & System | 10 | mesh-network, mesh-network-card, mesh-network-canvas, mesh-network-toolbar, network-messages, system-status, deployment-table, social-graph, org-chart, map |
| Operations | 8 | binnacle, instrument-binnacle, night-jobs, audit-log, gantt, kanban-board, entity-workbench, facet-workbench |
| Layout | 8 | grid-layout, section-card, admin-shell, settings-panel, dashboard, dashboard-strip, dashboard-renderer, header-shell |
| Agentic / AI | 7 | agent-trace, approval-chain, neural-nodes, augmented-brain, hub-spoke, active-missions, chat |
| Feedback | 6 | toast, state-scaffold, modal, notification-center, streaming-text, activity-feed |
| Theme Controls | 6 | theme-toggle, theme-rotary, ferrari-control, a11y, a11y-fab, dropdown-menu |
| Navigation | 5 | breadcrumb, tabs, stepper, section-nav, command-palette |
| Financial | 2 | finops, agent-cost-breakdown |

### Key Patterns

- **CVA + cn()** for variant styling
- **`"use client"`** only where hooks are used
- **Named exports** only (no default exports)
- **CSS custom properties** (`--mn-*`) for all colors — never hardcoded hex
- **Canvas components** use `ResizeObserver` + dimension guards + `CanvasSafeArc`
- **Hydration-safe formatting** via `mn-format.ts` (no `toLocaleString`)
- **Max 250 lines per file** — logic extracted to `.helpers.ts` siblings

## Documentation

| Path | Content |
|---|---|
| `AGENTS.md` | Guide for AI coding agents working on this codebase |
| `CLAUDE.md` | AI-first component selection rules, color tokens, page composition patterns |
| `CONSTITUTION.md` | Binding governance rules (accessibility, themes, code style) |
| `docs/guides/creating-a-component.md` | Step-by-step: naming, CVA template, theme tokens, barrel exports, registry, showcase, testing |
| `docs/guides/recipes.md` | 5 composition recipes: OKR Dashboard, CRUD Page, Analytics, Gantt+Detail, Simulator |
| `docs/guides/common-mistakes.md` | 10 real mistakes with wrong vs correct code examples |
| `docs/guides/adding-icons.md` | Lucide icons, `IconSlot` vs direct import, custom SVG, sizing & coloring |
| `docs/guides/adding-a-theme.md` | Adding a 5th theme: CSS tokens, ThemeProvider, theme-script, toggle/rotary |
| `docs/guides/extending-the-system.md` | Adding categories, themes, design tokens, WCAG AA compliance |
| `docs/guides/using-the-registry.md` | Installing components via shadcn CLI into your project |
| `docs/components/{category}/` | Per-component MDX: description, props table, code example, a11y notes |
| `docs/adr/` | Architecture decision records |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `API_URL` | `http://localhost:8420` | Backend API URL (server-side, optional) |
| `NEXT_PUBLIC_API_URL` | — | Client-side API URL (optional) |
| `SESSION_SECRET` | `convergio-dev-secret` | HMAC signing secret for session cookies |
| `MARANELLO_CONFIG_PATH` | `./maranello.yaml` | Override config file path |
| `CONVERGIO_CONFIG_PATH` | `./convergio.yaml` | Alternate config file path |

## Design Principles (CONSTITUTION.md)

- **WCAG 2.2 AA** minimum accessibility
- **4 themes always** — every component works in navy, dark, light, colorblind
- **Keyboard-first** — Cmd-K, Tab navigation, focus rings
- **Lucide icons only** — zero emoji (CONSTITUTION P2)
- **No raw `<table>`** — use `MnDataTable` for all tabular data (P9)
- **No custom metric cards** — use `MnDashboardStrip` or `MnKpiScorecard` (P10)
- **No hardcoded hex in JSX** — use `var(--mn-*)` tokens only (P11)
- **Catalog-first** — search `component-catalog-data.ts` before creating UI (P12)
- **Max 250 lines per file** — split into component + `.helpers.ts`
- **shadcn source-first** — UI components live in your repo, not in node_modules
- **TypeScript strict** — no `any`, named exports only
- **Config-driven** — branding, navigation, and pages defined in YAML

## License

MPL-2.0
