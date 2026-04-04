# Convergio Frontend — CLAUDE.md

## What is this

Cockpit UI for the Convergio daemon — a modular platform for autonomous AI organizations.
Built on Next.js 16, React 19, Maranello design system (100+ components, Mn* prefix).

## Architecture

Config-driven: `convergio.yaml` (or `maranello.yaml`) controls branding, navigation, pages.
See README.md for full stack documentation.

## Backend

Daemon API on http://localhost:8420. SSE for real-time events.
Backend repo: /Users/Roberdan/GitHub/convergio
To discover API routes: read daemon/crates/*/src/ext.rs → routes() method.

## Tracker

Progress tracked in ~/Desktop/FRONTEND-SPEC.md. Read it FIRST before any work.

## Agent operational rules (NON-NEGOTIABLE)

Hard-won learnings from building the backend. These prevent known failure modes.

### Workspace isolation (Learning #4)
- Every task runs in its own git worktree under `.worktrees/`
- NEVER work in the main checkout
- One worktree = one branch = one PR
- WHY: parallel agents on same checkout created branch chaos, commits on wrong branches, mixed work

### Rules must exist BEFORE agent launch (Learning #5)
- All rules must be in the tracker BEFORE launching agents
- Agents started mid-session NEVER read rules added after their launch
- WHY: 3 agents launched without isolation rules, all ignored them

### Checklist enforcement (Learning #6)
Every phase MUST close with ALL these steps:
1. `pnpm typecheck` — zero TS errors
2. `pnpm lint` — zero ESLint warnings
3. `pnpm test` — unit tests pass
4. `pnpm build` — production build OK
5. Visual check: page loads on localhost:3000
6. Update tracker: checkboxes + notes
7. Commit: conventional message + Co-Authored-By
8. PR: `gh pr create`, check review comments, resolve all before merge
9. Cleanup: remove worktree, delete branch, prune remote
- WHY: agents skipped tests, left stale branches, committed without PR

### Prompt pattern (Learning #7)
- Short prompt that tells agent to READ a file
- NEVER inline long prompts as -p argument — they silently hang
- Pattern: `claude -p "Leggi ~/Desktop/FRONTEND-SPEC.md. Riprendi dalla prima fase non completata."`

### Worktree location (Learning from backend)
- Worktrees go in `.worktrees/` INSIDE the repo
- NEVER in /tmp or /private or outside the project
- WHY: worktrees in /tmp are invisible, forgotten, never cleaned

### Cleanup after merge (Learning #11)
After every PR merge:
```bash
git worktree remove .worktrees/<name> --force
git branch -D feat/<branch>
git remote prune origin
```
- WHY: orchestrator left 6 stale worktrees + branches after merging

### Scope enforcement (Learning #4)
- Only modify files in YOUR task scope
- NEVER touch files from other phases/tasks
- If you need to change a shared file, ask the user first

### Fix root causes, never shortcuts (Constitution Rule #1)
NEVER take the quick path. ALWAYS fix the root cause.
- Component broken? Don't hide it with CSS — fix the component.
- API returns wrong data? Don't transform client-side — fix the backend.
- Test fails? Don't delete the test — fix the code.
- 3 consecutive fixes that each introduce new problems → STOP. Explain root cause, propose rebuild.

### Full reference
~/Desktop/WORKSPACE-SPLIT.md is the single source of truth for the entire project.
READ IT for any non-trivial decision.

## Design system

Components are in /src/components/maranello/ with Mn prefix.
Import: `import { MnBadge, MnChart } from "@/components/maranello"`
NEVER install external UI libraries. Create new Mn* components if needed.

## Copilot delegation

For mechanical CRUD pages that follow an established pattern:
```bash
cd .worktrees/fase-N
gh copilot --yolo --model claude-opus-4-6
```
Delegate: repetitive CRUD, test boilerplate, style fixes.
Do NOT delegate: architecture, SSE wiring, component decisions, Fase 0.
