# Convergio Frontend

Product-grade operational shell with Maranello visual language. Built on Next.js 16 App Router, shadcn/ui, Tailwind CSS v4.

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript --noEmit
```

Web dev works standalone — no backend, no Rust, no Tauri required.

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 App Router |
| UI Primitives | shadcn/ui + Base UI + Tailwind CSS v4 |
| Typography | Outfit (headings), Inter (body), Barlow Condensed (mono/data) |
| Themes | 4: Navy, Dark, Light, Colorblind |
| Icons | Lucide (no emoji) |
| AI | Vercel AI SDK v4 — multi-provider routing via convergio.yaml |
| Desktop | Tauri (optional, src-tauri/) |

## convergio.yaml — single config source

Everything about the app — branding, nav, pages, AI agents, API endpoint — lives in `convergio.yaml` at the root.  
Edit this file and restart the dev server to rebrand, add pages, or swap AI providers without touching source code.

```yaml
app:
  name: Convergio          # app title shown in header + browser tab

theme:
  default: navy            # light | dark | navy | colorblind

api:
  baseUrl: http://localhost:8420   # backend base URL; leave as-is for demo mode

ai:
  defaultAgent: jervis
  agents:
    - id: jervis
      provider: openai     # openai | anthropic | …
      model: gpt-4o
      apiRoute: /api/chat
```

`src/lib/config-loader.ts` reads the YAML at build time and validates it with Zod.  
`src/config/` re-exports typed config slices (navigation, pages, AI agents).

## Server-first data pattern

Data fetching follows a **server-first** pattern: **server actions** (`src/lib/actions/`) backed by a typed API client (`src/lib/api/client.ts`).  
If the backend is unreachable the action catches `ApiError` and returns a graceful fallback — the UI renders in demo mode with static data from `convergio.yaml`.

```
Request → Server Action → ApiClient.get/post/put/delete → backend
                                       ↓ ApiError caught
                              graceful fallback / demo data
```

No client-side `useEffect` fetch loops. Data flows server → RSC → client components only for interactivity.

## Auth boundary

The login page (`src/app/(auth)/login/page.tsx`) uses a server action with **demo credentials: `admin` / `admin`**.  
On success it sets an `httpOnly` session cookie; all dashboard routes sit behind `src/app/(dashboard)/layout.tsx` which checks it.

To replace with real auth:
1. Swap the credential check in `login/page.tsx` for your identity provider.
2. Replace the cookie logic with a signed JWT or session token as needed.
3. Protect API routes in `src/app/api/` with the same session check.

## AI chat & provider routing

Each AI agent in `convergio.yaml` declares its `provider`, `model`, and `systemPrompt`.  
`src/app/api/chat/route.ts` reads the agent config and streams responses via Vercel AI SDK.  
`src/components/blocks/ai-chat-panel.tsx` renders the chat UI using `useChat`.

To add a provider: add the `@ai-sdk/<provider>` package and reference it in the agent config.

## Themes

Switch via the header dropdown or command palette (Cmd-K).

| Theme | Background | Accent | Use case |
|---|---|---|---|
| Navy | Deep blue #0d2045 | Gold #FFC72C | Default — Maranello signature |
| Dark | Near-black #111111 | Gold #FFC72C | High contrast dark |
| Light | Warm ivory #FAF3E6 | Red #DC0000 | Light/warm (Avorio) |
| Colorblind | Dark #111111 | Blue #0072B2 | Okabe-Ito safe palette |

All themes pass WCAG 2.2 AA contrast requirements.

## Architecture

```
convergio.yaml              # single config source — edit to customise
src/
  app/
    (auth)/login/           # auth boundary — demo: admin / admin
    (dashboard)/            # protected shell; layout checks session cookie
      page.tsx              # dashboard (driven by convergio.yaml pages config)
      settings/             # settings form (server action + graceful fallback)
      agents/ activity/ …   # other nav pages
    api/
      chat/route.ts         # AI streaming endpoint (Vercel AI SDK)
      health/route.ts       # liveness probe
    layout.tsx              # root layout — fonts, theme script
    not-found.tsx
  components/
    blocks/                 # page blocks: kpi-card, data-table, ai-chat-panel…
    maranello/              # Maranello design system — 36 React components (see below)
    page-renderer.tsx       # interprets convergio.yaml pages → block grid
    shell/                  # app-shell, sidebar, header, command-menu
    theme/                  # theme-provider, theme-switcher, theme-script
    ui/                     # shadcn/ui source components
  config/                   # typed config slices read from convergio.yaml
  lib/
    api/client.ts           # typed ApiClient + ApiError
    actions/profile.ts      # server actions with graceful fallback
    config-loader.ts        # YAML parser + Zod validation
    env.ts                  # typed env vars (API_URL, …)
  types/                    # shared TypeScript types
src-tauri/                  # optional — Tauri desktop scaffold (see below)
```

## Maranello Design System

The Maranello component library (`src/components/maranello/`) is a set of 36 React components migrated from the original Web Components implementation to React + Tailwind CSS v4 + CVA (class-variance-authority). All components follow the `Mn` prefix convention, support all 4 themes, and are accessible (WCAG 2.2 AA).

```tsx
import { MnBadge, MnChart, MnDataTable } from "@/components/maranello"
```

Browse the live showcase at [`/preview`](/preview).

### Component catalogue

| # | Component | Primary export | Category | Description |
|---|---|---|---|---|
| 1 | Badge | `MnBadge` | Simple | Status/label badge with theme-aware variants |
| 2 | Avatar | `MnAvatar`, `MnAvatarGroup` | Simple | User avatar with image fallback and group stacking |
| 3 | Breadcrumb | `MnBreadcrumb` | Simple | Navigation breadcrumb trail |
| 4 | Form Field | `MnFormField` | Simple | Form field wrapper with label, hint, and error slots |
| 5 | State Scaffold | `MnStateScaffold` | Simple | Empty/loading/error state placeholder |
| 6 | Toast | `MnToast`, `toast()` | Simple | Notification toasts with imperative `toast()` API |
| 7 | Tabs | `MnTabs`, `MnTab`, `MnTabPanel` | Simple | Accessible tabbed interface |
| 8 | Modal | `MnModal` | Simple | Accessible modal dialog with focus trap |
| 9 | Customer Journey | `MnCustomerJourney` | Simple | Horizontal step/funnel journey visualization |
| 10 | Dashboard | `MnDashboard` | Simple | Responsive grid dashboard layout container |
| 11 | Command Palette | `MnCommandPalette` | Shell / Navigation | Cmd-K fuzzy command search overlay |
| 12 | Header Shell | `MnHeaderShell` | Shell / Navigation | Top-level app header bar |
| 13 | Section Nav | `MnSectionNav` | Shell / Navigation | Sidebar or horizontal section navigation |
| 14 | Theme Toggle | `MnThemeToggle` | Shell / Navigation | Light/dark theme toggle button |
| 15 | Theme Rotary | `MnThemeRotary` | Shell / Navigation | Rotary dial for cycling all 4 themes |
| 16 | Async Select | `MnAsyncSelect` | Shell / Navigation | Searchable select with async data loading |
| 17 | Date Picker | `MnDatePicker` | Shell / Navigation | Calendar date picker with range support |
| 18 | Profile | `MnProfile` | Shell / Navigation | User profile card with editable sections |
| 19 | Accessibility | `MnA11y` | Shell / Navigation | Accessibility preferences panel |
| 20 | Data Table | `MnDataTable` | Data | Sortable, filterable, paginated data table |
| 21 | Detail Panel | `MnDetailPanel` | Data | Slide-over detail view with field sections |
| 22 | Entity Workbench | `MnEntityWorkbench` | Data | Master-detail entity editor with tab groups |
| 23 | Facet Workbench | `MnFacetWorkbench` | Data | Faceted search and filter workbench |
| 24 | Chat | `MnChat` | Data | AI chat panel with message history and quick actions |
| 25 | OKR | `MnOkr` | Data | Objectives & Key Results tracker |
| 26 | System Status | `MnSystemStatus` | Data | Service health dashboard with incident timeline |
| 27 | Chart | `MnChart` | Canvas / Visual | Multi-series chart (line, bar, area, pie) via Recharts |
| 28 | Gauge | `MnGauge` | Canvas / Visual | Radial gauge with threshold zones |
| 29 | Speedometer | `MnSpeedometer` | Canvas / Visual | Ferrari-style speedometer dial |
| 30 | Funnel | `MnFunnel` | Canvas / Visual | Conversion funnel visualization |
| 31 | Horizontal Bar | `MnHbar` | Canvas / Visual | Horizontal stacked/grouped bar chart |
| 32 | Gantt | `MnGantt` | Canvas / Visual | Gantt chart for project timelines |
| 33 | Kanban Board | `MnKanbanBoard` | Canvas / Visual | Drag-and-drop kanban columns and cards |
| 34 | Map | `MnMap` | Canvas / Visual | Leaflet-based interactive map with markers |
| 35 | Mapbox | `MnMapbox` | Canvas / Visual | Mapbox GL JS map with markers |
| 36 | Ferrari Controls | `MnManettino`, `MnCruiseLever`, `MnToggleLever`, `MnSteppedRotary` | Controls | Ferrari-inspired rotary and lever control widgets |

## Tauri (optional — desktop builds)

The project ships a Tauri scaffold for packaging as a native desktop app.  
Web development does **not** require Rust or Tauri to be installed.

```bash
# Prerequisites: Rust + Tauri CLI
cargo install tauri-cli

pnpm tauri:dev    # desktop dev (wraps the Next.js dev server)
pnpm tauri:build  # native binary + installer
```

Tauri reads `src-tauri/tauri.conf.json`. The web bundle is embedded at build time.

## Design Principles

- **Maranello visual language**: typography, spacing, density from convergio-design
- **shadcn source-first**: UI components live in your repo, not node_modules
- **4 themes always**: every surface, button, badge works in all themes
- **Keyboard-first**: Cmd-K everywhere, Tab navigation, focus rings
- **WCAG 2.2 AA**: contrast ratios, reduced-motion, focus indicators
- **Max 250 lines per file**: enforced by convention
- **No emoji**: Lucide SVG icons only
