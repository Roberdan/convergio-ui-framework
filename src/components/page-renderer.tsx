import type { PageConfig, PageBlock } from "@/types";
import { loadAIConfig } from "@/lib/config-loader";
import { KpiCard, DataTable, ActivityFeed, StatList, EmptyState, AIChatPanel } from "@/components/blocks";
import {
  MnGauge,
  MnChart,
  MnGantt,
  MnKanbanBoard,
  MnFunnel,
  MnHbar,
  MnSpeedometer,
  MnMap,
  MnOkr,
  MnSystemStatus,
  MnDataTable,
} from "@/components/maranello";

/**
 * Page Renderer — transforms a PageConfig into rendered UI.
 *
 * Mobile-first responsive grid: single column on small screens,
 * configured columns on md+ breakpoints. Unknown block types
 * trigger a console.warn for debugging.
 */

/** Map column count to responsive Tailwind grid classes (mobile-first) */
function gridClasses(columns: number): string {
  const base = "grid grid-cols-1 gap-4";
  if (columns <= 1) return base;
  if (columns === 2) return `${base} md:grid-cols-2`;
  if (columns === 3) return `${base} sm:grid-cols-2 lg:grid-cols-3`;
  return `${base} sm:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)}`;
}

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
        <div key={ri} className={gridClasses(row.columns)}>
          {row.blocks.map((block, bi) => (
            <BlockRenderer key={bi} block={block} />
          ))}
        </div>
      ))}
    </div>
  );
}

const KNOWN_TYPES = new Set([
  "kpi-card", "data-table", "activity-feed",
  "stat-list", "empty-state", "ai-chat",
]);

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
    case "gauge-block":
      return <MnGauge {...block} />;
    case "chart-block": {
      const { type: _blockType, chartType, ...rest } = block; // eslint-disable-line @typescript-eslint/no-unused-vars
      return <MnChart type={chartType} {...rest} />;
    }
    case "gantt-block":
      return <MnGantt {...block} />;
    case "kanban-block":
      return <MnKanbanBoard {...block} />;
    case "funnel-block":
      return <MnFunnel {...block} />;
    case "hbar-block":
      return <MnHbar {...block} />;
    case "speedometer-block":
      return <MnSpeedometer {...block} />;
    case "map-block":
      return <MnMap {...block} />;
    case "okr-block":
      return <MnOkr {...block} />;
    case "system-status-block":
      return <MnSystemStatus {...block} />;
    case "data-table-maranello":
      return <MnDataTable {...block} />;
    default: {
      const unknownType = (block as { type: string }).type;
      if (!KNOWN_TYPES.has(unknownType)) {
        console.warn(`[PageRenderer] Unknown block type: "${unknownType}". Skipping.`);
      }
      return null;
    }
  }
}
