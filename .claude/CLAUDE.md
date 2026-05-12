# Claude Code — Convergio Workflow

> Rules and project map live in [../CONSTITUTION.md](../CONSTITUTION.md) and [../AGENTS.md](../AGENTS.md).
> This file holds **only** the Claude-specific Convergio plan-execution flow.

## Convergio process (NON-NEGOTIABLE — see CONSTITUTION X1-X8)

1. **Read the plan**: `cvg plan tree <plan_id> --human`
2. **Worktree per task**: `git worktree add .worktrees/<name> -b feat/<name>`
3. **Never work on the main checkout** (X8)
4. **Pre-commit checklist**:
   - `pnpm typecheck` — zero errors
   - `pnpm lint` — zero warnings
   - `pnpm test` — all pass
   - `pnpm build` — OK
5. **Commit + PR**: conventional commit, `gh pr create`
6. **Submit task**: `cvg task complete <id> --agent-id <name> --pr-url <url>` → status becomes `submitted`. Only Thor flips to `done` (X1).
7. **After merge**: `git worktree remove .worktrees/<name> --force && git branch -D feat/<name>`

## Scope discipline
- Only modify files in YOUR task scope.
- Need a shared file? Ask first.
- 3 consecutive fixes that introduce new problems → STOP, explain the root cause.

## Backend
- Daemon API: http://localhost:8420 (SSE for real-time).
- Backend repo: `/Users/Roberdan/GitHub/convergio`.

## Sub-agents
Persona sub-agents are defined in [agents/](./agents/) and can be invoked with the Task tool by name:
- `baccio` — quality, testing, a11y
- `jony` — tables, forms, modals, CRUD
- `nasra` — charts, gauges, real-time
- `sara-ux` — page composition, API integration
