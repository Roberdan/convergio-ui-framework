'use client';

import { cn } from '@/lib/utils';
import { useCallback, useId, useMemo } from 'react';

export interface MnHeatmapProps {
  /** 2D grid of cells: rows x cols */
  data: { label: string; value: number }[][];
  /** Min/max colors as CSS custom property names or raw values */
  colorScale?: { min: string; max: string };
  /** Show numeric values inside cells */
  showValues?: boolean;
  /** Accessible label for the heatmap */
  ariaLabel?: string;
  className?: string;
}

/** Interpolate between two colors via CSS opacity on the max color. */
function cellStyle(
  value: number,
  min: number,
  max: number,
  scale: { min: string; max: string },
): React.CSSProperties {
  const range = max - min || 1;
  const t = Math.max(0, Math.min(1, (value - min) / range));
  return {
    backgroundColor: scale.max,
    opacity: 0.15 + t * 0.85,
    color: t > 0.5 ? 'var(--foreground)' : 'var(--muted-foreground)',
  };
}

/**
 * Grid-based heatmap with color intensity mapping.
 *
 * Uses CSS custom properties for theming. Keyboard navigable
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
    () => colorScale ?? { min: 'var(--muted)', max: 'var(--primary)' },
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
            className="flex items-center justify-center rounded-md p-2 text-xs font-medium transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
