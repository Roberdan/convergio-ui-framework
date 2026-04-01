'use client';

import { cn } from '@/lib/utils';

export interface StripMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface MnDashboardStripProps {
  metrics: StripMetric[];
  ariaLabel?: string;
  className?: string;
}

const TREND_SYMBOLS: Record<string, { char: string; color: string; label: string }> = {
  up: { char: '\u2191', color: 'text-status-success', label: 'trending up' },
  down: { char: '\u2193', color: 'text-status-error', label: 'trending down' },
  flat: { char: '\u2192', color: 'text-muted-foreground', label: 'stable' },
};

/**
 * Compact horizontal metric strip.
 *
 * Displays key metrics inline with optional trend indicators.
 * Wraps responsively on small viewports. Each metric is
 * screen-reader accessible with value and trend.
 */
export function MnDashboardStrip({
  metrics,
  ariaLabel = 'Dashboard metrics',
  className,
}: MnDashboardStripProps) {
  if (!metrics.length) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-lg border bg-card px-4 py-2',
        className,
      )}
      role="list"
      aria-label={ariaLabel}
    >
      {metrics.map((metric, i) => {
        const trend = metric.trend ? TREND_SYMBOLS[metric.trend] : null;
        return (
          <div
            key={`${metric.label}-${i}`}
            role="listitem"
            className="flex items-baseline gap-1.5 text-sm"
            aria-label={`${metric.label}: ${metric.value}${metric.unit ? ` ${metric.unit}` : ''}${trend ? `, ${trend.label}` : ''}`}
          >
            <span className="text-xs text-muted-foreground">{metric.label}</span>
            <span className="font-semibold text-card-foreground tabular-nums">
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-xs text-muted-foreground">{metric.unit}</span>
            )}
            {trend && (
              <span
                className={cn('text-sm font-bold', trend.color)}
                aria-hidden="true"
              >
                {trend.char}
              </span>
            )}
            {/* separator between metrics */}
            {i < metrics.length - 1 && (
              <span className="ml-2 text-border" aria-hidden="true">|</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
