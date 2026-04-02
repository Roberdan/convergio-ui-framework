import type { LucideIcon } from "lucide-react";

/* ── Simple Page Blocks ── */

/** KPI card -- a single metric with label, value, and optional trend. */
export interface KpiCardBlock {
  type: "kpi-card";
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
}

/** Data table -- tabular data with typed columns and rows. */
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

/** Activity feed -- chronological event stream with status indicators. */
export interface ActivityFeedBlock {
  type: "activity-feed";
  items: {
    time: string;
    text: string;
    status?: "success" | "error" | "warning" | "info";
  }[];
}

/** Stat list -- vertical list of label-value pairs with optional status. */
export interface StatListBlock {
  type: "stat-list";
  items: {
    label: string;
    value: string;
    status?: "success" | "error" | "warning" | "info";
  }[];
}

/** Empty state -- placeholder shown when a section has no data yet. */
export interface EmptyStateBlock {
  type: "empty-state";
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

/** AI Chat Panel -- embedded agent chat interface. */
export interface AIChatBlock {
  type: "ai-chat";
  agentId?: string;
}

/* ── Page Structure ── */

/** Union of all available page block types. */
export type { PageBlock } from "./config-ai";

/** A horizontal row of blocks on a page. */
export interface PageRow {
  columns: number;
  blocks: import("./config-ai").PageBlock[];
}

/** Complete page configuration. */
export interface PageConfig {
  title: string;
  description?: string;
  rows: PageRow[];
}
