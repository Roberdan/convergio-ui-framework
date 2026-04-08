/**
 * Configuration types for the design-system framework.
 */

import type { LucideIcon } from "lucide-react";

/* ── App Config ── */

export interface AppConfig {
  name: string;
  logo?: string;
  description?: string;
  defaultTheme: "light" | "dark" | "navy" | "colorblind";
  themeStorageKey?: string;
}

/* ── Navigation ── */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: number;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface NavConfig {
  sections: NavSection[];
}

/* ── Simple Page Blocks ── */

export interface KpiCardBlock {
  type: "kpi-card";
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
}

export interface DataTableBlock {
  type: "data-table";
  columns: {
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    mono?: boolean;
  }[];
  rows: Record<string, string | number>[];
}

export interface ActivityFeedBlock {
  type: "activity-feed";
  items: {
    time: string;
    text: string;
    status?: "success" | "error" | "warning" | "info";
  }[];
}

export interface StatListBlock {
  type: "stat-list";
  items: {
    label: string;
    value: string;
    status?: "success" | "error" | "warning" | "info";
  }[];
}

export interface EmptyStateBlock {
  type: "empty-state";
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface AIChatBlock {
  type: "ai-chat";
  agentId?: string;
}

/* ── Maranello Visual Blocks ── */

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

export interface ChartBlock {
  type: "chart-block";
  chartType: "sparkline" | "donut" | "area" | "bar" | "radar" | "bubble";
  series?: { label?: string; data: number[]; color?: string }[];
  segments?: { value: number; label?: string; color?: string }[];
  points?: { x: number; y: number; z?: number; label?: string; color?: string }[];
  radarData?: { label: string; value: number }[];
  labels?: string[]; showLegend?: boolean; animate?: boolean;
}

export interface GanttBlockTask {
  id: string; title: string; start: string; end: string;
  status?: "active" | "planned" | "completed" | "on-hold" | "withdrawn";
  progress?: number; milestone?: boolean;
  dependencies?: string[]; children?: GanttBlockTask[];
}

export interface GanttBlock {
  type: "gantt-block";
  tasks: GanttBlockTask[];
  dependencies?: { from: string; to: string }[];
  labelWidth?: number; rowHeight?: number; showToday?: boolean;
}

export interface KanbanBlock {
  type: "kanban-block";
  columns: { id: string; title: string; color?: string }[];
  cards: { id: string; columnId: string; title: string; description?: string; assignee?: string; tags?: string[]; priority?: "low" | "medium" | "high" | "critical" }[];
}

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

export interface HbarBlock {
  type: "hbar-block";
  bars: { label: string; value: number; color?: string }[];
  title?: string; unit?: string; maxValue?: number;
  showValues?: boolean; showGrid?: boolean; sortDescending?: boolean;
  animate?: boolean; barHeight?: number; size?: "sm" | "md" | "lg" | "full";
}

export interface SpeedometerBlock {
  type: "speedometer-block";
  value?: number; min?: number; max?: number; unit?: string;
  ticks?: number[]; minorTicks?: number;
  animate?: boolean; size?: "sm" | "md" | "lg";
}

export interface MapBlock {
  type: "map-block";
  markers?: {
    id: string | number; lat: number; lon: number; label: string;
    detail?: string; color?: "active" | "warning" | "danger";
    size?: "sm" | "md" | "lg"; count?: number;
  }[];
  zoom?: number; center?: [number, number]; enableZoom?: boolean; enablePan?: boolean;
}

export interface OkrBlockKeyResult {
  id: string; title: string; current: number; target: number; unit?: string;
}

export interface OkrBlockObjective {
  id: string; title: string;
  status?: "on-track" | "at-risk" | "behind";
  keyResults: OkrBlockKeyResult[];
}

export interface OkrBlock {
  type: "okr-block";
  objectives: OkrBlockObjective[];
  title?: string; period?: string; defaultOpenFirst?: boolean;
}

export interface SystemStatusBlock {
  type: "system-status-block";
  services: { id: string; name: string; status: "operational" | "degraded" | "outage"; uptime?: number; latencyMs?: number }[];
  incidents?: { id: string; title: string; date: string; severity: "operational" | "degraded" | "outage"; resolved?: boolean }[];
  refreshInterval?: number; version?: string; environment?: string;
}

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

/* ── Page Structure ── */

export interface PageRow {
  columns: number;
  blocks: PageBlock[];
}

export interface PageConfig {
  title: string;
  description?: string;
  rows: PageRow[];
}
