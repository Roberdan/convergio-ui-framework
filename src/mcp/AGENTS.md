# MCP Server — Nasra Agent Tools

10 tools exposed via Model Context Protocol for AI agent integration.

| Tool | What |
|------|------|
| `search_components` | Fuzzy search catalog by keyword (EN/IT) |
| `get_component` | Get full details for a component by slug |
| `list_categories` | List all component categories |
| `list_block_types` | List available YAML block types |
| `generate_yaml_page` | Generate YAML page from natural language |
| `get_composition` | Get prebuilt component combos for use-cases |
| `get_theme_tokens` | Get CSS custom property names and values |
| `analyze_yaml_needs` | Parse YAML config → list required components |
| `resolve_component_deps` | Resolve transitive component dependencies |
| `install_components` | Generate shadcn install command with deps |

## Running
```bash
pnpm mcp              # stdio transport
npx tsx src/mcp/server.ts --http  # HTTP transport
```
