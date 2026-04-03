import { cva } from "class-variance-authority"

/* ── Types ─────────────────────────────────────────────────── */

export type KpiStatus = "green" | "yellow" | "red" | "neutral";

export interface KpiRow {
  id: string;
  label: string;
  unit?: string;
  target: number;
  actual: number;
  trend?: number[];
  status?: KpiStatus;
  format?: "number" | "percent" | "currency";
}

/* ── Constants ─────────────────────────────────────────────── */

export const STATUS_LABELS: Record<KpiStatus, string> = {
  green: "On track",
  yellow: "At risk",
  red: "Off track",
  neutral: "\u2014",
};

export const HEADERS = ["Metric", "Target", "Actual", "Delta", "Trend", "Status"] as const;

/* ── CVA variants ──────────────────────────────────────────── */

export const statusDotVariants = cva("inline-block size-2 rounded-full shrink-0", {
  variants: {
    status: {
      green: "bg-emerald-500 dark:bg-emerald-400",
      yellow: "bg-amber-500 dark:bg-amber-400",
      red: "bg-red-500 dark:bg-red-400",
      neutral: "bg-muted-foreground",
    },
  },
  defaultVariants: { status: "neutral" },
});

export const deltaVariants = cva("tabular-nums text-sm font-medium", {
  variants: {
    direction: {
      positive: "text-emerald-600 dark:text-emerald-400",
      negative: "text-red-600 dark:text-red-400",
      zero: "text-muted-foreground",
    },
  },
  defaultVariants: { direction: "zero" },
});

export const sparklineVariants = cva("inline-block", {
  variants: {
    status: {
      green: "text-emerald-500 dark:text-emerald-400",
      yellow: "text-amber-500 dark:text-amber-400",
      red: "text-red-500 dark:text-red-400",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: { status: "neutral" },
});

/* ── Helpers ─────────────────────────────────────────────── */

export function resolveStatus(row: KpiRow): KpiStatus {
  if (row.status) return row.status;
  if (row.actual >= row.target) return "green";
  if (row.actual >= row.target * 0.8) return "yellow";
  return "red";
}

export function fmtValue(val: number, fmt: KpiRow["format"], currency: string): string {
  if (fmt === "percent") return `${val}%`;
  const formatted = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(val);
  if (fmt === "currency") return `${currency}${formatted}`;
  return formatted;
}

export function fmtDelta(delta: number, fmt: KpiRow["format"], currency: string): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${fmtValue(delta, fmt, currency)}`;
}

export function deltaDirection(delta: number): "positive" | "negative" | "zero" {
  if (delta > 0) return "positive";
  if (delta < 0) return "negative";
  return "zero";
}
