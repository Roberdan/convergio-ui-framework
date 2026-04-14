# Convergio UI Framework — Copilot Instructions

## What is this
Dashboard framework for the Convergio daemon. Next.js 16, React 19, 103 Maranello components.
Read root `CLAUDE.md` for design rules. Read `AGENTS.md` for project map.
Each `src/` subdirectory has its own `AGENTS.md` with local context.

## Convergio process (NON-NEGOTIABLE)
1. **Read the plan**: `cvg plan tree <plan_id> --human`
2. **Worktree per task**: `git worktree add .worktrees/<name> feat/<name>`
3. **Never work on main checkout**
4. **Checklist before commit**:
   - `pnpm typecheck` — zero errors
   - `pnpm lint` — zero warnings
   - `pnpm test` — all pass
   - `pnpm build` — OK
5. **Commit + PR**: conventional commit with Co-authored-by, `gh pr create`
6. **Complete task**: `cvg task complete <id> --agent-id copilot-cli --pr-url <url>`
7. **After merge**: remove worktree, delete branch, prune remotes

## Rules (from CLAUDE.md)
1. No hardcoded colors — `var(--mn-*)` tokens only
2. 4 themes — test all (navy, dark, light, colorblind)
3. Lucide icons only — zero emoji
4. 250 lines max per file
5. Named exports only
6. TypeScript strict — no `any`
7. WCAG 2.2 AA
8. i18n — `useLocale("ns")`
9. Search catalog before creating UI

## Build commands
```bash
pnpm dev | pnpm build | pnpm lint | pnpm typecheck | pnpm test | pnpm test:e2e | pnpm mcp
```
