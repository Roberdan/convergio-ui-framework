# Convergio UI Framework — Claude Code Instructions

## What is this
Dashboard framework for the Convergio daemon. Next.js 16, React 19, 103 Maranello components.
Read root `CLAUDE.md` for design rules. Read `AGENTS.md` for project map.

## Convergio process (NON-NEGOTIABLE)
1. **Read the plan**: `cvg plan tree <plan_id> --human`
2. **Worktree per task**: `git worktree add .worktrees/<name> feat/<name>`
3. **Never work on main checkout**
4. **Checklist before commit**:
   - `pnpm typecheck` — zero errors
   - `pnpm lint` — zero warnings
   - `pnpm test` — all pass
   - `pnpm build` — OK
5. **Commit + PR**: conventional commit, `gh pr create`
6. **Complete task**: `cvg task complete <id> --agent-id <name> --pr-url <url>`
7. **After merge**: `git worktree remove .worktrees/<name> --force && git branch -D feat/<name>`

## Scope enforcement
- Only modify files in YOUR task scope
- If you need a shared file, ask first
- 3 consecutive fixes creating new problems → STOP, explain root cause

## Explore before building
Check `src/components/maranello/` categories before creating custom UI.
Search `src/lib/component-catalog-data.ts` by keyword.

## Backend
Daemon API: http://localhost:8420. SSE for real-time.
Backend repo: /Users/Roberdan/GitHub/convergio
