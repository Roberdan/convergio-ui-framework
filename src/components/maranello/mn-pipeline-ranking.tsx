'use client';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export interface PipelineStage {
  name: string;
  count: number;
  color?: string;
}

export interface MnPipelineRankingProps {
  stages: PipelineStage[];
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

const FUNNEL_PALETTE = [
  'var(--primary)',
  'var(--chart-2, hsl(160 60% 45%))',
  'var(--chart-3, hsl(30 80% 55%))',
  'var(--chart-4, hsl(280 65% 60%))',
  'var(--chart-5, hsl(340 75% 55%))',
  'var(--secondary)',
];

/**
 * Pipeline/funnel visualization with conversion rates.
 *
 * Horizontal bars sized proportionally to count.
 * Conversion rate shown between stages.
 */
export function MnPipelineRanking({
  stages,
  ariaLabel = 'Pipeline funnel',
  className,
}: MnPipelineRankingProps) {
  const maxCount = useMemo(
    () => Math.max(...stages.map((s) => s.count), 1),
    [stages],
  );

  if (!stages.length) return null;

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn('space-y-1 rounded-lg border bg-card p-4', className)}
    >
      {stages.map((stage, i) => {
        const widthPct = (stage.count / maxCount) * 100;
        const color = stage.color ?? FUNNEL_PALETTE[i % FUNNEL_PALETTE.length];
        const prevCount = i > 0 ? stages[i - 1].count : null;
        const convRate =
          prevCount && prevCount > 0
            ? ((stage.count / prevCount) * 100).toFixed(1)
            : null;

        return (
          <div key={stage.name} role="listitem">
            {/* conversion rate label */}
            {convRate && (
              <div
                className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
                aria-label={`Conversion from ${stages[i - 1].name}: ${convRate}%`}
              >
                <span className="ml-2" aria-hidden="true">
                  \u2193
                </span>
                <span>{convRate}% conversion</span>
              </div>
            )}

            {/* stage bar */}
            <div className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm font-medium text-card-foreground">
                {stage.name}
              </span>

              <div className="relative flex-1 h-8">
                <div
                  className="h-full rounded-md transition-all duration-300 flex items-center justify-end pr-2"
                  style={{
                    width: `${Math.max(widthPct, 4)}%`,
                    backgroundColor: color,
                  }}
                  tabIndex={0}
                  aria-label={`${stage.name}: ${stage.count}`}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--primary-foreground)' }}
                  >
                    {stage.count.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
