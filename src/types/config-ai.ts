import type {
  KpiCardBlock,
  DataTableBlock,
  ActivityFeedBlock,
  StatListBlock,
  EmptyStateBlock,
  AIChatBlock,
} from "./config-pages";

/* ── Maranello Visual Blocks ── */

/** Gauge block -- analogue-style gauge with needle, arc bar, and optional sub-dials. */
export interface GaugeBlock {
  type: "gauge-block";
  value?: number; min?: number; max?: number;
  unit?: string; label?: string;
  ticks?: number; subticks?: number; numbers?: number[];
  startAngle?: number; endAngle?: number; color?: string;
  arcBar?: { value: number; max: number; colorStops?: string[]; labelCenter?: string; labelLeft?: string; labelRight?: string };
  subDials?: { x: number; y: number; value: number; max: number; color: string; label: string }[];
  animate?: boolean; size?: "sm" | "md" | "lg" | "fluid";
}

/** Chart block -- multi-type chart. */
export interface ChartBlock {
  type: "chart-block";
  chartType: "sparkline" | "donut" | "area" | "bar" | "radar" | "bubble";
  series?: { label?: string; data: number[]; color?: string }[];
  segments?: { value: number; label?: string; color?: string }[];
  points?: { x: number; y: number; z?: number; label?: string; color?: string }[];
  radarData?: { label: string; value: number }[];
  labels?: string[]; showLegend?: boolean; animate?: boolean;
}

/** Gantt block task. */
export interface GanttBlockTask {
  id: string; title: string; start: string; end: string;
  status?: "active" | "planned" | "completed" | "on-hold" | "withdrawn";
  progress?: number; milestone?: boolean;
  dependencies?: string[]; children?: GanttBlockTask[];
}

/** Gantt block -- timeline chart with tasks, milestones, and dependencies. */
export interface GanttBlock {
  type: "gantt-block";
  tasks: GanttBlockTask[];
  dependencies?: { from: string; to: string }[];
  labelWidth?: number; rowHeight?: number; showToday?: boolean;
}

/** Kanban block -- board with draggable cards across columns. */
export interface KanbanBlock {
  type: "kanban-block";
  columns: { id: string; title: string; color?: string }[];
  cards: { id: string; columnId: string; title: string; description?: string; assignee?: string; tags?: string[]; priority?: "low" | "medium" | "high" | "critical" }[];
}

/** Funnel block -- conversion funnel with pipeline stages. */
export interface FunnelBlock {
  type: "funnel-block";
  data: {
    pipeline: { label: string; count: number; color?: string; holdCount?: number; withdrawnCount?: number }[];
    total?: number;
    onHold?: { count: number; color?: string };
    withdrawn?: { count: number; color?: string };
  };
  showConversion?: boolean; animate?: boolean; size?: "sm" | "md" | "lg" | "full";
}

/** Horizontal bar block -- ranked bar chart. */
export interface HbarBlock {
  type: "hbar-block";
  bars: { label: string; value: number; color?: string }[];
  title?: string; unit?: string; maxValue?: number;
  showValues?: boolean; showGrid?: boolean; sortDescending?: boolean;
  animate?: boolean; barHeight?: number; size?: "sm" | "md" | "lg" | "full";
}

/** Speedometer block -- circular speed-style gauge. */
export interface SpeedometerBlock {
  type: "speedometer-block";
  value?: number; min?: number; max?: number; unit?: string;
  ticks?: number[]; minorTicks?: number;
  animate?: boolean; size?: "sm" | "md" | "lg";
}

/** Map block -- SVG world map with positioned markers. */
export interface MapBlock {
  type: "map-block";
  markers?: {
    id: string | number; lat: number; lon: number; label: string;
    detail?: string; color?: "active" | "warning" | "danger";
    size?: "sm" | "md" | "lg"; count?: number;
  }[];
  zoom?: number; center?: [number, number]; enableZoom?: boolean; enablePan?: boolean;
}

/** OKR block key result. */
export interface OkrBlockKeyResult {
  id: string; title: string; current: number; target: number; unit?: string;
}

/** OKR block objective. */
export interface OkrBlockObjective {
  id: string; title: string;
  status?: "on-track" | "at-risk" | "behind";
  keyResults: OkrBlockKeyResult[];
}

/** OKR block -- objectives & key results tracker. */
export interface OkrBlock {
  type: "okr-block";
  objectives: OkrBlockObjective[];
  title?: string; period?: string; defaultOpenFirst?: boolean;
}

/** System status block -- service health dashboard with incidents. */
export interface SystemStatusBlock {
  type: "system-status-block";
  services: { id: string; name: string; status: "operational" | "degraded" | "outage"; uptime?: number; latencyMs?: number }[];
  incidents?: { id: string; title: string; date: string; severity: "operational" | "degraded" | "outage"; resolved?: boolean }[];
  refreshInterval?: number; version?: string; environment?: string;
}

/** Maranello data table -- advanced table with sorting, filtering, pagination. */
export interface DataTableMaranelloBlock {
  type: "data-table-maranello";
  columns: { key: string; label?: string; sortable?: boolean; filterable?: boolean; align?: "left" | "center" | "right"; width?: string | number }[];
  data: Record<string, unknown>[];
  pageSize?: number; groupBy?: string; selectable?: "single" | "multi";
  compact?: boolean; loading?: boolean; emptyMessage?: string;
}

/** Union of all available page block types. */
export type PageBlock =
  | KpiCardBlock
  | DataTableBlock
  | ActivityFeedBlock
  | StatListBlock
  | EmptyStateBlock
  | AIChatBlock
  | GaugeBlock
  | ChartBlock
  | GanttBlock
  | KanbanBlock
  | FunnelBlock
  | HbarBlock
  | SpeedometerBlock
  | MapBlock
  | OkrBlock
  | SystemStatusBlock
  | DataTableMaranelloBlock;
