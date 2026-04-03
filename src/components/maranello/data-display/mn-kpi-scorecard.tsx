"use client";

import { cn } from "@/lib/utils";
import {
  type KpiStatus, type KpiRow,
  STATUS_LABELS, HEADERS,
  statusDotVariants, deltaVariants, sparklineVariants,
  resolveStatus, fmtValue, fmtDelta, deltaDirection,
} from "./mn-kpi-scorecard.helpers";

export type { KpiStatus, KpiRow } from "./mn-kpi-scorecard.helpers";

/* ── Props ─────────────────────────────────────────────────── */

export interface MnKpiScorecardProps {
  rows: KpiRow[];
  currency?: string;
  onSelect?: (row: KpiRow) => void;
  ariaLabel?: string;
  className?: string;
}

/* ── Sparkline ─────────────────────────────────────────────── */

function Sparkline({ data, status }: { data: number[]; status: KpiStatus }) {
  if (data.length < 2) return null;

  const w = 60;
  const h = 24;
  const pad = 2;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const range = mx - mn || 1;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - mn) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className={sparklineVariants({ status })}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MnKpiScorecard({
  rows,
  currency = "$",
  onSelect,
  ariaLabel = "KPI Scorecard",
  className,
}: MnKpiScorecardProps) {
  if (!rows.length) return null;

  const interactive = !!onSelect;

  return (
    <div className={cn("overflow-x-auto rounded-lg border bg-card", className)}>
      <table className="w-full text-sm" role="table" aria-label={ariaLabel}>
        <thead>
          <tr className="border-b bg-muted/50">
            {HEADERS.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y">
          {rows.map((row) => {
            const status = resolveStatus(row);
            const delta = row.actual - row.target;
            const fmt = row.format ?? "number";

            return (
              <tr
                key={row.id}
                className={cn(
                  "transition-colors",
                  interactive &&
                    "cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                )}
                tabIndex={interactive ? 0 : undefined}
                role="row"
                aria-label={`${row.label}: actual ${fmtValue(row.actual, fmt, currency)}, target ${fmtValue(row.target, fmt, currency)}, ${STATUS_LABELS[status]}`}
                onClick={interactive ? () => onSelect(row) : undefined}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(row);
                        }
                      }
                    : undefined
                }
              >
                <td className="px-4 py-3 font-medium text-card-foreground">
                  {row.label}
                  {row.unit && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      {row.unit}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {fmtValue(row.target, fmt, currency)}
                </td>
                <td className="px-4 py-3 tabular-nums font-semibold text-card-foreground">
                  {fmtValue(row.actual, fmt, currency)}
                </td>
                <td className="px-4 py-3">
                  <span className={deltaVariants({ direction: deltaDirection(delta) })}>
                    {fmtDelta(delta, fmt, currency)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.trend && row.trend.length >= 2 && (
                    <Sparkline data={row.trend} status={status} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={statusDotVariants({ status })}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-muted-foreground">
                      {STATUS_LABELS[status]}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
