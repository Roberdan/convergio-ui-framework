# App Routes

Next.js App Router layout.

| Route | What |
|-------|------|
| `(dashboard)/layout.tsx` | Dashboard layout — loads config, renders AppShell, imports block registrations |
| `(dashboard)/[...slug]/page.tsx` | Catch-all for YAML-defined pages (uses PageRenderer) |
| `(dashboard)/showcase/` | Component showcase (all 103 Maranello components) |
| `(dashboard)/dashboard/` | Main dashboard page |
| `api/chat/route.ts` | AI chat endpoint — 5 providers (openai, azure, anthropic, copilot, qwen) |
| `api/health/route.ts` | Health check endpoint |

## Adding a page
1. **YAML-only**: Add under `pages:` in maranello.yaml + navigation entry
2. **Custom React**: Create `src/app/(dashboard)/your-page/page.tsx` — inherits shell automatically
