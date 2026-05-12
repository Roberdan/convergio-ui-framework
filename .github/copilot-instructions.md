# Convergio UI Framework — Copilot Instructions

Dashboard framework for the Convergio daemon. Next.js 16, React 19, 107 Maranello components.

## Where to look

- **Rules** (binding, do not violate): [CONSTITUTION.md](../CONSTITUTION.md) — P1-P12, A1-A7, T1-T4, C1-C4, X1-X8.
- **Project map**: [AGENTS.md](../AGENTS.md) — directories, build commands, personas.
- **Per-subdir guides**: every `src/` subdirectory has its own `AGENTS.md`.
- **Convergio workflow**: [.claude/CLAUDE.md](../.claude/CLAUDE.md) — worktree per task, `cvg plan tree`, Thor gate.

## Copilot-specific

When completing a Convergio task with Copilot CLI:
- Use `--agent-id copilot-cli` on `cvg task complete`.
- Add `Co-authored-by: GitHub Copilot <copilot@github.com>` to the commit trailer.

All other rules and workflow steps come from the files above. Do not duplicate them here.
