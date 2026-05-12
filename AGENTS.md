# Convergio UI Framework — Agent Guide

Config-driven dashboard framework. 108 Maranello components, 4 themes, Next.js 16, React 19.

> **Rules live in [CONSTITUTION.md](./CONSTITUTION.md).** This file is the **project map** — where things are and how to run them. Do not duplicate rules here.

## Quick orientation

| Directory | What | Guide |
|-----------|------|-------|
| `src/components/maranello/` | 108 Mn* design system components | Each category has its own AGENTS.md |
| `src/components/shell/` | App shell (sidebar, header, layout) | [AGENTS.md](src/components/shell/AGENTS.md) |
| `src/components/blocks/` | Built-in page blocks (KPI, table, feed) | [AGENTS.md](src/components/blocks/AGENTS.md) |
| `src/lib/` | Config loader, block registry, i18n, utils | [AGENTS.md](src/lib/AGENTS.md) |
| `src/hooks/` | Data fetching, SSE, real-time hooks | [AGENTS.md](src/hooks/AGENTS.md) |
| `src/app/` | Next.js routes (dashboard, showcase, API) | [AGENTS.md](src/app/AGENTS.md) |
| `src/mcp/` | MCP server for AI agents (`maranello-catalog`) | [AGENTS.md](src/mcp/AGENTS.md) |
| `src/types/` | TypeScript types (config, AI, blocks) | [AGENTS.md](src/types/AGENTS.md) |
| `packages/core/` | @convergio/core npm package (re-exports) | [AGENTS.md](packages/core/AGENTS.md) |

## Persona sub-agents

Specialist personas live in [`.claude/agents/`](./.claude/agents/) and can be invoked via Claude Code's Task tool by name:

| Agent | Domain |
|---|---|
| `baccio` | Quality, testing, accessibility, theme verification |
| `jony` | Tables, forms, modals, detail panels, CRUD |
| `nasra` | Charts, gauges, real-time streaming, dashboards |
| `sara-ux` | Page composition, API integration, data transforms |

## MCP servers

The repo ships two MCP servers in [.mcp.json](./.mcp.json):

| Name | Purpose | Setup |
|---|---|---|
| `maranello-catalog` | Search the 108-entry component catalog (`search_components`, `get_component`, `analyze_yaml_needs`) | Works out of the box — runs `pnpm mcp` |
| `convergio` | Talks to the Convergio daemon | Requires `CONVERGIO_DAEMON_BIN` env var pointing at the compiled `convergio-mcp-server` binary |

For the `convergio` entry, add this to your shell rc once per machine:

```bash
export CONVERGIO_DAEMON_BIN="$HOME/GitHub/convergio/daemon/target/release/convergio-mcp-server"
```

Adjust the path if the daemon repo lives elsewhere. If the variable is unset, Claude Code will skip the server with a startup warning — the rest of the framework keeps working.

## Build commands

```bash
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
pnpm test       # Vitest
pnpm test:e2e   # Playwright
pnpm mcp        # MCP server (Maranello catalog tools)
```

## Workflow

The Convergio plan-execution flow (worktrees, `cvg plan tree`, Thor gate) is documented in [.claude/CLAUDE.md](./.claude/CLAUDE.md) and bound by [CONSTITUTION.md](./CONSTITUTION.md) X1-X8.
