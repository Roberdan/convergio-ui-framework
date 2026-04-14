# Convergio UI Framework — Copilot Instructions

## What is this

Cockpit UI for the Convergio daemon — a modular platform for autonomous AI organizations.
Built on Next.js 16, React 19, Maranello design system (103+ components, Mn* prefix).
Config-driven: `convergio.yaml` (or `maranello.yaml`) controls branding, navigation, pages.

## Stack

- Frontend: Next.js 16 + Maranello design system (103 components, 4 themes)
- Config: `maranello.yaml` / `convergio.yaml` is the source of truth
- Backend: Daemon API on http://localhost:8420, SSE for real-time events
- Backend repo: /Users/Roberdan/GitHub/convergio

## Convergio process (NON-NEGOTIABLE)

This project is managed through Convergio plans. Follow this protocol:

1. **Read the plan**: `cvg plan tree <plan_id> --human`
2. **Create worktree per task**: `git worktree add .worktrees/<task-name> feat/<task-name>`
3. **Do the work** in the worktree — NEVER on main checkout
4. **Checklist before commit** (ALL must pass):
   - `pnpm typecheck` — zero TS errors
   - `pnpm lint` — zero ESLint warnings
   - `pnpm test` — unit tests pass
   - `pnpm build` — production build OK
5. **Commit + PR**: conventional commit with Co-authored-by trailer, `gh pr create`
6. **Complete task**: `cvg task complete <db_id> --agent-id copilot-cli --evidence "..."`
7. **After merge cleanup**:
   ```bash
   git worktree remove .worktrees/<name> --force
   git branch -D feat/<branch>
   git remote prune origin
   ```

Gate order: `EvidenceGate → TestGate → PrCommitGate → WaveSequenceGate → ValidatorGate(Thor)`

## Agent operational rules (NON-NEGOTIABLE)

### Workspace isolation
- Every task runs in its own git worktree under `.worktrees/`
- NEVER work in the main checkout
- One worktree = one branch = one PR

### Scope enforcement
- Only modify files in YOUR task scope
- NEVER touch files from other tasks
- If you need to change a shared file, ask the user first

### Fix root causes, never shortcuts
- Component broken? Don't hide it with CSS — fix the component.
- API returns wrong data? Don't transform client-side — fix the backend.
- Test fails? Don't delete the test — fix the code.
- 3 consecutive fixes that each introduce new problems → STOP. Explain root cause, propose rebuild.

### Explore design system BEFORE building
NEVER grab a random component. FIRST explore what Maranello has:
- `src/components/maranello/agentic/` — agent activity, delegation, AI
- `src/components/maranello/data-viz/` — charts, gauges, treemaps, timelines
- `src/components/maranello/data-display/` — tables, lists, cards, badges
- `src/components/maranello/forms/` — inputs, selects, dialogs
- `src/components/maranello/feedback/` — alerts, toasts, progress
- `src/components/maranello/layout/` — grids, panels, splits

## Design system rules

- Zero hardcoded colors — use `var(--mn-*)` tokens or Tailwind semantic classes
- 4 themes (navy/dark/light/colorblind) — test all
- Lucide icons only, no emoji (CONSTITUTION P2)
- Max 250 lines per file — split into `.helpers.ts` siblings
- Named exports only — no `export default` for components
- `"use client"` only on files that use React hooks
- WCAG 2.2 AA accessibility
- TypeScript strict — no `any` types
- English code and docs
- All user-facing strings via `useLocale("namespace")` — no hardcoded English in JSX

## Import conventions

```tsx
// Maranello components — import from barrel
import { MnDataTable, MnBadge } from "@/components/maranello"
// i18n
import { useLocale } from "@/lib/i18n"
// Icons
import { BarChart3, Users } from "lucide-react"
// Utils
import { cn } from "@/lib/utils"
```

## Build & test commands

```bash
pnpm dev          # dev server at http://localhost:3000
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript strict check
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # Playwright E2E
pnpm mcp          # MCP server for AI agents
```
