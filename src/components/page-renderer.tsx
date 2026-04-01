import type { PageConfig, PageBlock } from "@/types";
import { loadAIConfig } from "@/lib/config-loader";
import { KpiCard, DataTable, ActivityFeed, StatList, EmptyState, AIChatPanel } from "@/components/blocks";

/**
 * Page Renderer — transforms a PageConfig into rendered UI.
 *
 * This is the core of the config-driven page system.
 * It reads a PageConfig (title, description, rows of blocks)
 * and renders the corresponding block components in a CSS grid.
 *
 * Usage in a Next.js page:
 * ```tsx
 * import { PageRenderer } from "@/components/page-renderer";
 * import { loadPageConfig } from "@/lib/config-loader";
 *
 * export default function DashboardPage() {
 *   const config = loadPageConfig("/");
 *   if (!config) return null;
 *   return <PageRenderer config={config} />;
 * }
 * ```
 *
 * The renderer maps each block's `type` field to the correct component.
 * Unknown block types are silently skipped.
 */
export function PageRenderer({ config }: { config: PageConfig }) {
  return (
    <div className="space-y-6">
      <div>
        <h1>{config.title}</h1>
        {config.description && (
          <p className="text-caption mt-1">{config.description}</p>
        )}
      </div>
      {config.rows.map((row, ri) => (
        <div
          key={ri}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))` }}
        >
          {row.blocks.map((block, bi) => (
            <BlockRenderer key={bi} block={block} />
          ))}
        </div>
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: PageBlock }) {
  switch (block.type) {
    case "kpi-card":
      return <KpiCard {...block} />;
    case "data-table":
      return <DataTable {...block} />;
    case "activity-feed":
      return <ActivityFeed {...block} />;
    case "stat-list":
      return <StatList {...block} />;
    case "empty-state":
      return <EmptyState {...block} />;
    case "ai-chat":
      return <AIChatPanel defaultAgentId={block.agentId} aiConfig={loadAIConfig()} />;
    default:
      return null;
  }
}
