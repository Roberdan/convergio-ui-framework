'use client';

import { cn } from '@/lib/utils';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Touchpoint {
  channel: string;
  sentiment: Sentiment;
}

export interface JourneyStage {
  name: string;
  touchpoints: Touchpoint[];
}

export interface MnCustomerJourneyMapProps {
  stages: JourneyStage[];
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

const sentimentColor: Record<Sentiment, string> = {
  positive: 'bg-emerald-500',
  neutral: 'bg-amber-500',
  negative: 'bg-red-500',
};

const sentimentLabel: Record<Sentiment, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
};

/**
 * Customer journey map visualization.
 *
 * Horizontal timeline of stages with touchpoint dots colored by sentiment.
 * Responsive: scrolls horizontally on small screens.
 */
export function MnCustomerJourneyMap({
  stages,
  ariaLabel = 'Customer Journey Map',
  className,
}: MnCustomerJourneyMapProps) {
  if (!stages.length) return null;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn('rounded-lg border bg-card overflow-x-auto', className)}
    >
      <div className="flex min-w-max">
        {stages.map((stage, si) => (
          <div
            key={stage.name}
            className="flex-1 min-w-[10rem] flex flex-col relative"
            role="group"
            aria-label={`Stage: ${stage.name}`}
          >
            {/* Connector line */}
            {si < stages.length - 1 && (
              <div
                className="absolute top-10 right-0 w-full h-0.5 bg-border -z-0"
                aria-hidden="true"
              />
            )}

            {/* Stage header */}
            <div className="relative z-10 flex flex-col items-center p-4 pb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {si + 1}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-center">
                {stage.name}
              </h3>
            </div>

            {/* Touchpoints */}
            <div className="px-4 pb-4 flex flex-col gap-1.5">
              {stage.touchpoints.map((tp, ti) => (
                <div
                  key={`${tp.channel}-${ti}`}
                  className="flex items-center gap-2 text-xs"
                  aria-label={`${tp.channel}: ${sentimentLabel[tp.sentiment]}`}
                >
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full shrink-0',
                      sentimentColor[tp.sentiment],
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{tp.channel}</span>
                </div>
              ))}
              {stage.touchpoints.length === 0 && (
                <span className="text-xs text-muted-foreground italic">
                  No touchpoints
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t text-xs text-muted-foreground">
        {(['positive', 'neutral', 'negative'] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className={cn('h-2 w-2 rounded-full', sentimentColor[s])}
              aria-hidden="true"
            />
            {sentimentLabel[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
