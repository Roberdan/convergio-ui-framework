/**
 * A2UI (Agent-to-UI) protocol types.
 *
 * Defines the block structure pushed by backend agents to the frontend
 * via the daemon's /api/a2ui endpoints. Blocks are rendered in real-time
 * by the A2UIBlockRenderer component.
 */

export type A2UIBlockType =
  | "notification"
  | "alert"
  | "progress"
  | "card"
  | "chart"
  | "table";

export type A2UIPriority = "low" | "normal" | "high" | "critical";
export type A2UIStatus = "active" | "dismissed" | "expired";

export interface A2UITarget {
  page: string | null;
  position: "top" | "bottom" | "sidebar" | null;
}

/** Block JSON payload varies by block_type. */
export interface A2UINotificationPayload {
  type: "notification";
  title: string;
  body?: string;
}

export interface A2UIAlertPayload {
  type: "alert";
  title: string;
  body?: string;
  severity: "info" | "warning" | "error" | "success";
}

export interface A2UIProgressPayload {
  type: "progress";
  title: string;
  percent: number;
  label?: string;
}

export interface A2UICardPayload {
  type: "card";
  title: string;
  body?: string;
  icon?: string;
}

export interface A2UIChartPayload {
  type: "chart";
  title: string;
  chart_type: "bar" | "line" | "pie";
  data: Record<string, unknown>[];
}

export interface A2UITablePayload {
  type: "table";
  title: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

export type A2UIBlockPayload =
  | A2UINotificationPayload
  | A2UIAlertPayload
  | A2UIProgressPayload
  | A2UICardPayload
  | A2UIChartPayload
  | A2UITablePayload;

export interface A2UIBlock {
  block_id: string;
  agent_id: string;
  target: A2UITarget;
  block: A2UIBlockPayload;
  priority: A2UIPriority;
  status: A2UIStatus;
  ttl_seconds: number | null;
  created_at: string;
}

/** SSE event from /api/a2ui/stream */
export interface A2UIStreamEvent {
  event: "block_pushed" | "block_dismissed" | "block_replaced";
  data: A2UIBlock;
}

/** REST response from GET /api/a2ui/blocks */
export interface A2UIBlocksResponse {
  ok: boolean;
  blocks: A2UIBlock[];
}
