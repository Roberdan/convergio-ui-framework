'use client';

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useCallback, useId, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────────
export interface HeatmapColorScale {
  /** CSS color or variable for the low end */
  min: string;
  /** CSS color or variable for the high end */
  max: string;
  /** Optional midpoint for diverging scales */
  mid?: string;
}

export interface MnHeatmapProps {
  /** 2D grid of cells: rows x cols */
  data: { label: string; value: number }[][];
  /** Color scale endpoints (supports CSS variables and raw colors) */
  colorScale?: HeatmapColorScale;
  /** Show numeric values inside cells */
  showValues?: boolean;
  /** Accessible label for the heatmap */
  ariaLabel?: string;
  className?: string;
}

// ── CVA ──────────────────────────────────────────────────────────
const cellVariants = cva([
  'flex items-center justify-center rounded-md p-2 text-xs font-medium',
  'transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
]);

const DEFAULT_SCALE: HeatmapColorScale = {
  min: 'var(--muted)',
  max: 'var(--primary)',
};

// ── Color interpolation via oklch color-mix ──────────────────────

/**
 * Blends between scale colors in the oklch perceptual color space.
 * Supports a mid-point for diverging palettes (e.g. red-white-green).
 */
function interpolateColor(t: number, scale: HeatmapColorScale): string {
  const clamped = Math.max(0, Math.min(1, t));
  const pct = Math.round(clamped * 100);

  if (scale.mid) {
    if (clamped < 0.5) {
      const subPct = Math.round(clamped * 2 * 100);
      return `color-mix(in oklch, ${scale.mid} ${subPct}%, ${scale.min})`;
    }
    const subPct = Math.round((clamped - 0.5) * 2 * 100);
    return `color-mix(in oklch, ${scale.max} ${subPct}%, ${scale.mid})`;
  }

  return `color-mix(in oklch, ${scale.max} ${pct}%, ${scale.min})`;
}

function cellStyle(
  value: number,
  lo: number,
  hi: number,
  scale: HeatmapColorScale,
): React.CSSProperties {
  const range = hi - lo || 1;
  const t = Math.max(0, Math.min(1, (value - lo) / range));

  return {
    backgroundColor: interpolateColor(t, scale),
    color:
      t > 0.55
        ? 'var(--mn-text, var(--foreground))'
        : 'var(--mn-text-muted, var(--muted-foreground))',
  };
}

// ── Main component ───────────────────────────────────────────────

/**
 * Grid-based heatmap with smooth oklch color interpolation.
 *
 * Blends between min/max (or min/mid/max for diverging scales)
 * using the perceptually uniform oklch color space. Supports
 * CSS variables for full theme compatibility. Keyboard navigable
 * with arrow keys inside the grid. Each cell has an aria-label.
 */
export function MnHeatmap({
  data,
  colorScale,
  showValues = false,
  ariaLabel = 'Heatmap',
  className,
}: MnHeatmapProps) {
  const id = useId();
  const scale = useMemo(
    () => colorScale ?? DEFAULT_SCALE,
    [colorScale],
  );

  const { min, max } = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const row of data) {
      for (const cell of row) {
        if (cell.value < lo) lo = cell.value;
        if (cell.value > hi) hi = cell.value;
      }
    }
    return { min: lo === Infinity ? 0 : lo, max: hi === -Infinity ? 1 : hi };
  }, [data]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, ri: number, ci: number) => {
      const cols = data[0]?.length ?? 0;
      const rows = data.length;
      let nr = ri;
      let nc = ci;
      if (e.key === 'ArrowRight') nc = Math.min(ci + 1, cols - 1);
      else if (e.key === 'ArrowLeft') nc = Math.max(ci - 1, 0);
      else if (e.key === 'ArrowDown') nr = Math.min(ri + 1, rows - 1);
      else if (e.key === 'ArrowUp') nr = Math.max(ri - 1, 0);
      else return;
      e.preventDefault();
      const next = document.getElementById(`${id}-${nr}-${nc}`);
      next?.focus();
    },
    [data, id],
  );

  if (!data.length) return null;

  const cols = data[0]?.length ?? 0;

  return (
    <div
      role="grid"
      aria-label={ariaLabel}
      className={cn('inline-grid gap-1', className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(2.5rem, 1fr))` }}
    >
      {data.map((row, ri) =>
        row.map((cell, ci) => (
          <div
            key={`${ri}-${ci}`}
            id={`${id}-${ri}-${ci}`}
            role="gridcell"
            tabIndex={ri === 0 && ci === 0 ? 0 : -1}
            aria-label={`${cell.label}: ${cell.value}`}
            className={cn(cellVariants())}
            style={cellStyle(cell.value, min, max, scale)}
            onKeyDown={(e) => handleKeyDown(e, ri, ci)}
          >
            {showValues ? cell.value : cell.label}
          </div>
        )),
      )}
    </div>
  );
}
