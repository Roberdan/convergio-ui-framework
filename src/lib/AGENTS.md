# Lib — Framework Core Logic

| File | What | Used by |
|------|------|---------|
| `config-loader.ts` | Parses maranello.yaml, validates with Zod, caches | Layout, shell, pages |
| `config-schema.ts` | Zod schema for the config file | config-loader |
| `config-block-schemas.ts` | Zod schemas for each page block type | config-loader |
| `block-registry.ts` | Dynamic component registry for PageRenderer | page-renderer, blocks |
| `block-registrations.ts` | Registers all built-in block types (lazy) | Dashboard layout |
| `component-catalog-data.ts` | 103-entry searchable catalog | MCP tools, search |
| `icon-map.ts` | Lucide icon name → component resolver | Sidebar, nav |
| `i18n/` | Locale provider, useLocale(), 80+ namespaces | All components |
| `utils.ts` | `cn()` class merger (clsx + tailwind-merge) | All components |
| `env.ts` | API_URL env var validation | API client |
| `session.ts` | Cookie signing/verification | Auth routes |

## Key patterns
- Config file resolution: `$MARANELLO_CONFIG_PATH` > `./maranello.yaml` > `./convergio.yaml`
- Block registry: `registerBlock(type, component)` — lazy loaded via `React.lazy()`
- i18n: `useLocale("namespace")` for client, `resolveLocale("namespace")` for server
