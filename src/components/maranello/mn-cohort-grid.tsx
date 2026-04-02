'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useCallback, useId, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CohortRow {
  label: string;
  initialSize: number;
  /** Retention values per period (0-1 fraction). */
  retention: number[];
}

export interface MnCohortGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cohortGridVariants> {
  rows: CohortRow[];
  periodLabels?: string[];
  /** Show absolute user counts instead of percentages. */
  showAbsolute?: boolean;
  /** Called when the user hovers a retention cell. */
  onCellHover?: (row: CohortRow, periodIdx: number, value: number) => void;
}

/* ------------------------------------------------------------------ */
/*  CVA                                                                */
/* ------------------------------------------------------------------ */

const cohortGridVariants = cva(
  'w-full overflow-x-auto rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface-raised)]',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

type RGB = [number, number, number];

function parseHex(hex: string): RGB {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function lerpRgb(low: RGB, high: RGB, t: number): RGB {
  const ct = Math.max(0, Math.min(1, t));
  return [
    Math.round(low[0] + (high[0] - low[0]) * ct),
    Math.round(low[1] + (high[1] - low[1]) * ct),
    Math.round(low[2] + (high[2] - low[2]) * ct),
  ];
}

function contrastColor(r: number, g: number, b: number): string {
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? 'var(--mn-text-inverse, #111)' : 'var(--mn-text, #fafafa)';
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

const COLOR_HIGH: RGB = parseHex('#00A651');
const COLOR_LOW: RGB = parseHex('#DC0000');

function formatCell(retention: number, initialSize: number, absolute: boolean): string {
  if (absolute) return Math.round(initialSize * retention).toLocaleString();
  return `${(retention * 100).toFixed(0)}%`;
}

function periodHeader(labels: string[] | undefined, idx: number): string {
  return labels?.[idx] ?? `Period ${idx}`;
}

function maxPeriods(rows: CohortRow[]): number {
  let m = 0;
  for (const row of rows) {
    if (row.retention.length > m) m = row.retention.length;
  }
  return m;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MnCohortGrid({
  rows,
  periodLabels,
  showAbsolute = false,
  onCellHover,
  size,
  className,
  ...rest
}: MnCohortGridProps) {
  const id = useId();
  const periods = useMemo(() => maxPeriods(rows), [rows]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTableCellElement>, ri: number, ci: number) => {
      let nr = ri;
      let nc = ci;
      if (e.key === 'ArrowRight') nc = Math.min(ci + 1, periods - 1);
      else if (e.key === 'ArrowLeft') nc = Math.max(ci - 1, 0);
      else if (e.key === 'ArrowDown') nr = Math.min(ri + 1, rows.length - 1);
      else if (e.key === 'ArrowUp') nr = Math.max(ri - 1, 0);
      else return;
      e.preventDefault();
      document.getElementById(`${id}-${nr}-${nc}`)?.focus();
    },
    [id, periods, rows.length],
  );

  if (!rows.length) return null;

  return (
    <div className={cn(cohortGridVariants({ size }), className)} {...rest}>
      <table
        role="table"
        aria-label="Cohort retention grid"
        className="w-full border-collapse"
      >
        <thead>
          <tr>
            <th
              scope="col"
              role="columnheader"
              className="sticky left-0 z-10 bg-[var(--mn-surface-raised)] px-3 py-2 text-left font-semibold text-[var(--mn-text-muted)]"
            >
              Cohort
            </th>
            {Array.from({ length: periods }, (_, i) => (
              <th
                key={i}
                scope="col"
                role="columnheader"
                className="px-3 py-2 text-center font-semibold text-[var(--mn-text-muted)]"
              >
                {periodHeader(periodLabels, i)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-[var(--mn-border)]">
              <td className="sticky left-0 z-10 bg-[var(--mn-surface-raised)] px-3 py-2 font-medium text-[var(--mn-text)]">
                {row.label}{' '}
                <span className="text-[var(--mn-text-muted)]">
                  (n={row.initialSize.toLocaleString()})
                </span>
              </td>

              {Array.from({ length: periods }, (_, ci) => {
                const retention = row.retention[ci];
                const empty = retention === undefined || retention === null;

                if (empty) {
                  return (
                    <td
                      key={ci}
                      className="px-3 py-2 text-center text-[var(--mn-text-muted)]"
                      aria-label={`${row.label} ${periodHeader(periodLabels, ci)}: no data`}
                    >
                      &mdash;
                    </td>
                  );
                }

                const [r, g, b] = lerpRgb(COLOR_LOW, COLOR_HIGH, retention);
                const display = formatCell(retention, row.initialSize, showAbsolute);

                return (
                  <td
                    key={ci}
                    id={`${id}-${ri}-${ci}`}
                    tabIndex={ri === 0 && ci === 0 ? 0 : -1}
                    role="gridcell"
                    aria-label={`${row.label} ${periodHeader(periodLabels, ci)}: ${display}`}
                    className={cn(
                      'px-3 py-2 text-center font-medium transition-opacity',
                      'focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)] focus-visible:outline-none',
                      ci === 0 && 'font-bold',
                    )}
                    style={{
                      backgroundColor: `rgb(${r},${g},${b})`,
                      color: contrastColor(r, g, b),
                    }}
                    onMouseEnter={
                      onCellHover
                        ? () => onCellHover(row, ci, retention)
                        : undefined
                    }
                    onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
