# Convergio UI Framework — AI Instructions

> Single source of truth for normative rules: [CONSTITUTION.md](./CONSTITUTION.md).
> Project map and per-directory guides: [AGENTS.md](./AGENTS.md).
> Convergio-specific workflow (worktrees, `cvg plan`, Thor gate): [.claude/CLAUDE.md](./.claude/CLAUDE.md).
> Persona agents (Baccio, Jony, Nasra, Sara-UX): [.claude/agents/](./.claude/agents/).

## Start here
1. Skim [CONSTITUTION.md](./CONSTITUTION.md) — binding rules (P1-P12, A1-A7, T1-T4, C1-C4).
2. Read [AGENTS.md](./AGENTS.md) — where things live.
3. For task-specific work, enter the subdir and read its local `AGENTS.md`.

## Tooling shortcuts

### Component lookup
Search `src/lib/component-catalog-data.ts` (108 entries) by keyword and read `whenToUse`. Or call the MCP server:

```bash
pnpm mcp            # exposes search_components, get_component, analyze_yaml_needs
```

The MCP server is also wired in [.mcp.json](./.mcp.json) as `maranello-catalog` for auto-discovery.

### Import convention
```tsx
import { MnDataTable, MnBadge } from "@/components/maranello";
import { useLocale } from "@/lib/i18n";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
```

### Color tokens (C3, T2)
```css
var(--mn-accent)       var(--mn-surface)         var(--mn-text)
var(--mn-success)      var(--mn-surface-raised)  var(--mn-text-muted)
var(--mn-warning)      var(--mn-surface-sunken)  var(--mn-border)
var(--mn-error)        var(--mn-hover-bg)        var(--mn-focus-ring)
```

### Page composition
```tsx
// Maranello components only, pure data mapping
export function Page() {
  const data = useApiQuery(() => fetchData());
  return (
    <>
      <MnDashboardStrip metrics={buildMetrics(data)} />
      <MnDataTable columns={COLS} data={buildRows(data)} />
    </>
  );
}
```
