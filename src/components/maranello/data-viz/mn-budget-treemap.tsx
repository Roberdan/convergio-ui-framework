'use client';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export interface TreemapItem {
  name: string;
  value: number;
  color?: string;
}

export interface MnBudgetTreemapProps {
  items: TreemapItem[];
  /** Total budget. If omitted, sum of items is used. */
  total?: number;
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
  item: TreemapItem;
  pct: number;
}

const PALETTE = [
  'var(--primary)',
  'var(--chart-2, hsl(160 60% 45%))',
  'var(--chart-3, hsl(30 80% 55%))',
  'var(--chart-4, hsl(280 65% 60%))',
  'var(--chart-5, hsl(340 75% 55%))',
  'var(--secondary)',
];

/**
 * Squarified treemap layout (simplified strip algorithm).
 *
 * Alternates horizontal/vertical slicing per level for
 * roughly square cells. Works well for up to ~20 items.
 */
function layoutStrip(
  items: { item: TreemapItem; pct: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
): LayoutRect[] {
  if (!items.length) return [];
  if (items.length === 1) {
    return [{ x, y, w, h, item: items[0].item, pct: items[0].pct }];
  }

  const totalPct = items.reduce((s, i) => s + i.pct, 0);
  const horizontal = w >= h;
  const rects: LayoutRect[] = [];
  let offset = 0;

  for (const entry of items) {
    const ratio = totalPct > 0 ? entry.pct / totalPct : 1 / items.length;
    const span = horizontal ? w * ratio : h * ratio;
    rects.push({
      x: horizontal ? x + offset : x,
      y: horizontal ? y : y + offset,
      w: horizontal ? span : w,
      h: horizontal ? h : span,
      item: entry.item,
      pct: entry.pct,
    });
    offset += span;
  }

  return rects;
}

/**
 * Budget treemap visualization.
 *
 * Renders proportional rectangles for budget items.
 * Labels and percentages shown inside cells when space allows.
 * Keyboard navigable, screen-reader accessible.
 */
export function MnBudgetTreemap({
  items,
  total: totalProp,
  ariaLabel = 'Budget treemap',
  className,
}: MnBudgetTreemapProps) {
  const total = totalProp ?? items.reduce((s, i) => s + i.value, 0);

  const rects = useMemo(() => {
    const sorted = [...items]
      .sort((a, b) => b.value - a.value)
      .map((item) => ({ item, pct: total > 0 ? (item.value / total) * 100 : 0 }));
    return layoutStrip(sorted, 0, 0, 100, 100);
  }, [items, total]);

  if (!items.length) return null;

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn('relative h-64 w-full rounded-lg border bg-card overflow-hidden', className)}
    >
      {rects.map((r, i) => {
        const bg = r.item.color ?? PALETTE[i % PALETTE.length];
        const showLabel = r.w > 12 && r.h > 15;
        return (
          <div
            key={r.item.name}
            role="listitem"
            tabIndex={0}
            aria-label={`${r.item.name}: ${r.item.value} (${r.pct.toFixed(1)}%)`}
            className="absolute flex flex-col items-center justify-center overflow-hidden border border-background/20 p-1 text-xs font-medium transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              width: `${r.w}%`,
              height: `${r.h}%`,
              backgroundColor: bg,
              color: 'var(--primary-foreground)',
            }}
          >
            {showLabel && (
              <>
                <span className="truncate max-w-full">{r.item.name}</span>
                <span className="opacity-80">{r.pct.toFixed(1)}%</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
