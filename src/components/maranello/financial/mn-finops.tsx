'use client';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { formatNumber } from '../shared/mn-format';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface FinOpsMetric {
  label: string;
  value: number;
  trend: TrendDirection;
  budget: number;
}

export interface MnFinOpsProps {
  metrics: FinOpsMetric[];
  /** Format values (default: toLocaleString) */
  formatValue?: (v: number) => string;
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

const trendIcon: Record<TrendDirection, string> = {
  up: '\u25B2',
  down: '\u25BC',
  flat: '\u25CF',
};

const trendColor: Record<TrendDirection, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-red-600 dark:text-red-400',
  flat: 'text-muted-foreground',
};

/**
 * Financial operations dashboard with budget vs actual bars.
 *
 * Each metric shows value, trend indicator, and budget utilization bar.
 * Overspend highlighted in destructive color.
 */
export function MnFinOps({
  metrics,
  formatValue,
  ariaLabel = 'Financial Operations',
  className,
}: MnFinOpsProps) {
  const fmt = useMemo(
    () => formatValue ?? formatNumber,
    [formatValue],
  );

  if (!metrics.length) return null;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn('rounded-lg border bg-card', className)}
    >
      <div className="grid gap-px bg-border">
        {metrics.map((m) => {
          const pct = m.budget > 0 ? Math.min((m.value / m.budget) * 100, 150) : 0;
          const isOver = m.value > m.budget;
          const barWidth = Math.min(pct, 100);
          const overWidth = isOver ? Math.min(pct - 100, 50) : 0;

          return (
            <div
              key={m.label}
              className="bg-card p-4 flex flex-col gap-2"
              role="group"
              aria-label={`${m.label}: ${fmt(m.value)} of ${fmt(m.budget)} budget`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn('text-xs', trendColor[m.trend])}
                    aria-label={`Trend: ${m.trend}`}
                  >
                    {trendIcon[m.trend]}
                  </span>
                  <span className="text-sm font-mono tabular-nums font-semibold">
                    {fmt(m.value)}
                  </span>
                </div>
              </div>

              {/* Budget bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isOver ? 'bg-destructive' : 'bg-primary',
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                  {isOver && overWidth > 0 && (
                    <div
                      className="absolute top-0 h-full bg-destructive/40 rounded-r-full"
                      style={{ left: '100%', width: `${overWidth}%` }}
                    />
                  )}
                </div>
                <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Actual: {fmt(m.value)}</span>
                <span>Budget: {fmt(m.budget)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
