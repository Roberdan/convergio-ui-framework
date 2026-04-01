import type { LucideIcon } from "lucide-react";

/* ── Re-export icon resolver for convenience ── */

/* ── App Config ── */

/**
 * Top-level application configuration.
 * Defines branding, identity and default behavior for the entire frontend.
 * Change this file to rebrand the app for a different product.
 *
 * @example
 * ```ts
 * const app: AppConfig = {
 *   name: "VirtualBPM",
 *   description: "Process management platform",
 *   defaultTheme: "dark",
 * };
 * ```
 */
export interface AppConfig {
  /** Display name shown in sidebar header, browser tab, and login page. */
  name: string;
  /** Path to logo image (relative or absolute URL). Optional. */
  logo?: string;
  /** Short description for meta tags and login page subtitle. */
  description?: string;
  /** Theme applied on first visit before user makes a choice. */
  defaultTheme: "light" | "dark" | "navy" | "colorblind";
}

/* ── Navigation ── */

/**
 * A single navigation link in the sidebar.
 *
 * @example
 * ```ts
 * { id: "dashboard", label: "Dashboard", href: "/", iconName: "LayoutDashboard" }
 * ```
 */
export interface NavItem {
  /** Unique identifier. Used as React key. */
  id: string;
  /** Visible label in the sidebar. */
  label: string;
  /** Route path. Must match a Next.js page under (dashboard)/. */
  href: string;
  /** Lucide icon name resolved at render time via icon-map. */
  iconName: string;
  /** Optional count badge (e.g. unread notifications). */
  badge?: number;
}

/**
 * A group of navigation items with a section label.
 * Rendered as an uppercase label followed by the items list.
 *
 * @example
 * ```ts
 * { label: "Operations", items: [agentsItem, securityItem] }
 * ```
 */
export interface NavSection {
  /** Uppercase section header (e.g. "OVERVIEW", "OPERATIONS"). */
  label: string;
  /** Navigation items in this section. */
  items: NavItem[];
}

/**
 * Full navigation configuration for the sidebar.
 * Pass this to the AppShell to define the sidebar structure.
 */
export interface NavConfig {
  sections: NavSection[];
}

/* ── Page Blocks ── */

/**
 * KPI card — a single metric with label, value, and optional trend.
 * Use for: revenue, active users, uptime %, task count, or any headline number.
 * Typically placed in a row of 3-4 cards at the top of a dashboard page.
 *
 * @example
 * ```ts
 * { type: "kpi-card", label: "Active Agents", value: "12", change: "+2", trend: "up" }
 * ```
 */
export interface KpiCardBlock {
  type: "kpi-card";
  /** Metric label (e.g. "Active Agents", "Revenue", "Uptime"). */
  label: string;
  /** Metric value as display string (e.g. "12", "$4.2M", "99.7%"). */
  value: string;
  /** Change indicator (e.g. "+2", "-5%", "+$120K"). Optional. */
  change?: string;
  /** Trend direction. Controls the color of the change indicator. */
  trend?: "up" | "down" | "flat";
}

/**
 * Data table — tabular data with typed columns and rows.
 * Use for: agent lists, task queues, audit logs, user tables, inventory.
 * Supports monospace columns for IDs/codes and right-aligned numeric columns.
 *
 * @example
 * ```ts
 * {
 *   type: "data-table",
 *   columns: [
 *     { key: "id", label: "Agent", mono: true },
 *     { key: "status", label: "Status" },
 *     { key: "tasks", label: "Tasks", align: "right" },
 *   ],
 *   rows: [
 *     { id: "alfa-01", status: "active", tasks: 4 },
 *   ],
 * }
 * ```
 */
export interface DataTableBlock {
  type: "data-table";
  /** Column definitions. Each column maps to a key in the row objects. */
  columns: {
    /** Property key in row data. */
    key: string;
    /** Column header label. */
    label: string;
    /** Text alignment. Default: "left". Use "right" for numbers. */
    align?: "left" | "right" | "center";
    /** Render value in monospace font. Use for IDs, codes, hashes. */
    mono?: boolean;
  }[];
  /** Row data. Each row is a flat object with string or number values. */
  rows: Record<string, string | number>[];
}

/**
 * Activity feed — chronological event stream with status indicators.
 * Use for: recent activity, audit trail, deployment log, agent event history.
 *
 * @example
 * ```ts
 * {
 *   type: "activity-feed",
 *   items: [
 *     { time: "2m ago", text: "Agent alfa-01 completed task T3-04", status: "success" },
 *     { time: "1h ago", text: "Build failed on main", status: "error" },
 *   ],
 * }
 * ```
 */
export interface ActivityFeedBlock {
  type: "activity-feed";
  items: {
    /** Relative or absolute timestamp. */
    time: string;
    /** Event description. */
    text: string;
    /** Status determines the colored dot indicator. Default: "info". */
    status?: "success" | "error" | "warning" | "info";
  }[];
}

/**
 * Stat list — vertical list of label-value pairs with optional status.
 * Use for: system health, security policy status, feature flag states, config summary.
 *
 * @example
 * ```ts
 * {
 *   type: "stat-list",
 *   items: [
 *     { label: "Egress firewall", value: "active", status: "success" },
 *     { label: "Kill switch", value: "standby", status: "warning" },
 *   ],
 * }
 * ```
 */
export interface StatListBlock {
  type: "stat-list";
  items: {
    /** Item label. */
    label: string;
    /** Item value or status text. */
    value: string;
    /** Optional status for color coding. */
    status?: "success" | "error" | "warning" | "info";
  }[];
}

/**
 * Empty state — placeholder shown when a section has no data yet.
 * Use for: first-time user experience, empty lists, no search results.
 *
 * @example
 * ```ts
 * {
 *   type: "empty-state",
 *   title: "No projects yet",
 *   description: "Create your first project to get started.",
 *   actionLabel: "Create Project",
 *   actionHref: "/projects/new",
 * }
 * ```
 */
export interface EmptyStateBlock {
  type: "empty-state";
  /** Optional Lucide icon displayed above the title. */
  icon?: LucideIcon;
  /** Heading text. */
  title: string;
  /** Supporting description. */
  description: string;
  /** Optional CTA button label. */
  actionLabel?: string;
  /** Optional CTA button link. */
  actionHref?: string;
}

/**
 * AI Chat Panel — embedded agent chat interface.
 * Use for: agent interaction, Q&A, command execution, platform operations.
 * Powered by Vercel AI SDK with streaming responses.
 *
 * @example
 * ```ts
 * { type: "ai-chat", agentId: "jervis" }
 * ```
 */
export interface AIChatBlock {
  type: "ai-chat";
  /** Agent ID from ai.config.ts. Uses default agent if omitted. */
  agentId?: string;
}

/**
 * Union of all available page block types.
 * The page renderer uses the `type` field to select the correct block component.
 * To add a new block type: define the interface, add it here, and create
 * the corresponding component in src/components/blocks/.
 */
export type PageBlock =
  | KpiCardBlock
  | DataTableBlock
  | ActivityFeedBlock
  | StatListBlock
  | EmptyStateBlock
  | AIChatBlock;

/* ── Page Config ── */

/**
 * A horizontal row of blocks on a page.
 * The `columns` field controls the CSS grid: blocks are distributed evenly
 * across the specified number of columns.
 *
 * @example
 * ```ts
 * { columns: 4, blocks: [kpi1, kpi2, kpi3, kpi4] }
 * ```
 */
export interface PageRow {
  /** Number of grid columns (1-12). Blocks are distributed evenly. */
  columns: number;
  /** Blocks to render in this row. */
  blocks: PageBlock[];
}

/**
 * Complete page configuration.
 * Defines the title, description, and content layout for a single page.
 * The page renderer reads this config and produces the full page UI.
 *
 * @example
 * ```ts
 * const dashboardPage: PageConfig = {
 *   title: "Dashboard",
 *   description: "Platform overview and activity.",
 *   rows: [
 *     { columns: 4, blocks: [kpi1, kpi2, kpi3, kpi4] },
 *     { columns: 2, blocks: [activityFeed, agentTable] },
 *   ],
 * };
 * ```
 */
export interface PageConfig {
  /** Page heading (rendered as h1). */
  title: string;
  /** Subtitle shown below the heading. Optional. */
  description?: string;
  /** Content rows. Rendered top to bottom. */
  rows: PageRow[];
}
