# ADR 0002: MCP Server for AI Agent Integration

Status: Accepted | Date: 08 Apr 2026

## Context

AI agents (Copilot CLI, Claude Desktop, NaSra, custom agents) that want to use the Convergio Frontend Framework have no structured way to discover the 101+ components, generate valid YAML configs, or get composition advice. Agents were forced to grep through `component-catalog-data.ts` (452 lines) or read the full README (500+ lines) to find what they needed.

The Model Context Protocol (MCP) provides a standard interface for tools that AI agents can call. An MCP server eliminates the "read the whole codebase" problem by exposing the framework's knowledge as callable tools.

## Decision

Ship a built-in MCP server at `src/mcp/server.ts` with 7 tools:

| Tool | Purpose |
|---|---|
| `search_components` | Fuzzy search catalog by name/category/keyword |
| `get_component` | Full component details with props and example |
| `list_categories` | Category listing with counts |
| `generate_yaml_page` | YAML page config from natural language |
| `list_block_types` | Available block types for YAML pages |
| `get_composition` | Recommended component combinations for use-cases |
| `get_theme_tokens` | Theme color tokens for all 4 themes |

The server reads from the real component catalog (`component-catalog-data.ts`) and uses the real block type definitions — zero hardcoded duplicate data.

### Transport

- **stdio** (default) — for local clients: Copilot CLI, Claude Desktop, VS Code
- Run via `pnpm mcp` or `npx tsx src/mcp/server.ts`

### Integration modes

1. **Direct** — any MCP client configures the server in its `mcp.json` and calls tools directly
2. **Via NaSra** — NaSra (the data-viz specialist agent) has the MCP server as a tool source, making framework knowledge transparent to users who just talk to NaSra

## Consequences

- Positive: Agents can discover components in <1s instead of reading 500+ lines
- Positive: YAML generation eliminates wrong-block-type errors
- Positive: Composition advice prevents custom UIs when ready-made components exist
- Positive: No new runtime dependency — MCP SDK is already in the dep tree via Next.js/shadcn
- Negative: MCP server code must be kept in sync with catalog — but since it imports directly from `component-catalog-data.ts`, this happens automatically
- Negative: Compositions are manually curated (6 presets) — could be expanded over time

## Enforcement

- The MCP server is tested via stdio round-trip in CI (initialize + tools/list)
- NaSra's agent definition references MCP tools as available knowledge sources
