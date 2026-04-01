'use client';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export interface WaterfallStep {
  label: string;
  value: number;
  type: 'increase' | 'decrease' | 'total';
}

export interface MnWaterfallProps {
  steps: WaterfallStep[];
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

interface BarLayout {
  step: WaterfallStep;
  y: number;
  h: number;
  running: number;
  prevRunning: number;
}

const COLORS = {
  increase: 'var(--status-success, hsl(142 71% 45%))',
  decrease: 'var(--status-error, hsl(0 84% 60%))',
  total: 'var(--primary)',
} as const;

/**
 * Waterfall chart for financial/flow analysis.
 *
 * SVG-based bars with connecting lines and running totals.
 * Each bar shows the incremental change from previous step.
 */
export function MnWaterfall({
  steps,
  ariaLabel = 'Waterfall chart',
  className,
}: MnWaterfallProps) {
  const bars = useMemo(() => {
    const result: BarLayout[] = [];
    let running = 0;

    for (const step of steps) {
      const prevRunning = running;
      if (step.type === 'total') {
        result.push({ step, y: 0, h: running, running, prevRunning });
      } else {
        const newRunning = running + step.value;
        result.push({
          step,
          y: step.type === 'increase' ? running : newRunning,
          h: Math.abs(step.value),
          running: newRunning,
          prevRunning,
        });
        running = newRunning;
      }
    }
    return result;
  }, [steps]);

  const maxVal = useMemo(() => {
    if (!bars.length) return 100;
    let hi = 0;
    for (const b of bars) {
      const top = b.y + b.h;
      if (top > hi) hi = top;
      if (b.y > hi) hi = b.y;
    }
    return hi || 100;
  }, [bars]);

  if (!steps.length) return null;

  const barWidth = 40;
  const gap = 20;
  const chartH = 200;
  const svgW = steps.length * (barWidth + gap) + gap;
  const labelH = 40;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('overflow-x-auto rounded-lg border bg-card p-4', className)}
    >
      <svg
        viewBox={`0 0 ${svgW} ${chartH + labelH}`}
        className="w-full"
        style={{ minWidth: `${Math.max(svgW, 300)}px` }}
      >
        {/* baseline */}
        <line
          x1={0}
          y1={chartH}
          x2={svgW}
          y2={chartH}
          stroke="var(--border)"
          strokeWidth={1}
        />

        {bars.map((bar, i) => {
          const x = gap + i * (barWidth + gap);
          const scale = chartH / maxVal;
          const barH = bar.h * scale;
          const barY = chartH - (bar.y + bar.h) * scale;
          const color = COLORS[bar.step.type];

          return (
            <g key={i} role="listitem" aria-label={`${bar.step.label}: ${bar.step.value}`}>
              {/* connector line from previous bar */}
              {i > 0 && bar.step.type !== 'total' && (
                <line
                  x1={x - gap}
                  y1={chartH - bar.prevRunning * scale}
                  x2={x}
                  y2={chartH - bar.prevRunning * scale}
                  stroke="var(--muted-foreground)"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              )}

              {/* bar */}
              <rect
                x={x}
                y={barY}
                width={barWidth}
                height={Math.max(barH, 1)}
                rx={3}
                fill={color}
                className="transition-opacity hover:opacity-80"
              />

              {/* value label */}
              <text
                x={x + barWidth / 2}
                y={barY - 4}
                textAnchor="middle"
                className="text-[10px] fill-foreground"
              >
                {bar.step.type === 'decrease' ? '' : '+'}
                {bar.step.type === 'total' ? bar.running : bar.step.value}
              </text>

              {/* step label */}
              <text
                x={x + barWidth / 2}
                y={chartH + 14}
                textAnchor="middle"
                className="text-[9px] fill-muted-foreground"
              >
                {bar.step.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
