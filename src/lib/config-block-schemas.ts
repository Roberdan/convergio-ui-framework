import { z } from "zod";

/**
 * Zod schemas for YAML page block types.
 * Discriminated union keyed on `type` field.
 */

const kpiCardSchema = z.object({
  type: z.literal("kpi-card"),
  label: z.string().min(1),
  value: z.string(),
  change: z.string().optional(),
  trend: z.enum(["up", "down", "flat"]).optional(),
});

const dataTableColSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  align: z.enum(["left", "right", "center"]).optional(),
  mono: z.boolean().optional(),
});

const dataTableSchema = z.object({
  type: z.literal("data-table"),
  columns: z.array(dataTableColSchema),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
});

const activityFeedSchema = z.object({
  type: z.literal("activity-feed"),
  items: z.array(z.object({
    time: z.string(),
    text: z.string(),
    status: z.enum(["success", "error", "warning", "info"]).optional(),
  })),
});

const statListSchema = z.object({
  type: z.literal("stat-list"),
  items: z.array(z.object({
    label: z.string(),
    value: z.string(),
    status: z.enum(["success", "error", "warning", "info"]).optional(),
  })),
});

const emptyStateSchema = z.object({
  type: z.literal("empty-state"),
  title: z.string().min(1),
  description: z.string(),
  actionLabel: z.string().optional(),
  actionHref: z.string().optional(),
});

const aiChatSchema = z.object({
  type: z.literal("ai-chat"),
  agentId: z.string().optional(),
});

const gaugeSchema = z.object({
  type: z.literal("gauge-block"),
  value: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional(),
  label: z.string().optional(),
  animate: z.boolean().optional(),
  size: z.enum(["sm", "md", "lg", "fluid"]).optional(),
}).passthrough();

const chartSchema = z.object({
  type: z.literal("chart-block"),
  chartType: z.enum(["sparkline", "donut", "area", "bar", "radar", "bubble"]),
  showLegend: z.boolean().optional(),
  animate: z.boolean().optional(),
}).passthrough();

const ganttSchema = z.object({
  type: z.literal("gantt-block"),
  tasks: z.array(z.record(z.string(), z.unknown())),
}).passthrough();

const kanbanSchema = z.object({
  type: z.literal("kanban-block"),
  columns: z.array(z.record(z.string(), z.unknown())),
  cards: z.array(z.record(z.string(), z.unknown())),
});

const funnelSchema = z.object({
  type: z.literal("funnel-block"),
  data: z.object({
    pipeline: z.array(z.object({
      label: z.string(),
      count: z.number(),
    }).passthrough()),
    total: z.number().optional(),
  }).passthrough(),
  animate: z.boolean().optional(),
  size: z.enum(["sm", "md", "lg", "full"]).optional(),
});

const hbarSchema = z.object({
  type: z.literal("hbar-block"),
  bars: z.array(z.object({
    label: z.string(),
    value: z.number(),
    color: z.string().optional(),
  })),
}).passthrough();

const speedometerSchema = z.object({
  type: z.literal("speedometer-block"),
  value: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
}).passthrough();

const mapSchema = z.object({
  type: z.literal("map-block"),
}).passthrough();

const okrSchema = z.object({
  type: z.literal("okr-block"),
  objectives: z.array(z.record(z.string(), z.unknown())),
}).passthrough();

const systemStatusSchema = z.object({
  type: z.literal("system-status-block"),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(["operational", "degraded", "outage"]),
  }).passthrough()),
}).passthrough();

const dataTableMaranelloSchema = z.object({
  type: z.literal("data-table-maranello"),
  columns: z.array(z.record(z.string(), z.unknown())),
  data: z.array(z.record(z.string(), z.unknown())),
}).passthrough();

/** Discriminated union of all block types, keyed on `type`. */
export const blockSchema = z.discriminatedUnion("type", [
  kpiCardSchema,
  dataTableSchema,
  activityFeedSchema,
  statListSchema,
  emptyStateSchema,
  aiChatSchema,
  gaugeSchema,
  chartSchema,
  ganttSchema,
  kanbanSchema,
  funnelSchema,
  hbarSchema,
  speedometerSchema,
  mapSchema,
  okrSchema,
  systemStatusSchema,
  dataTableMaranelloSchema,
]);
