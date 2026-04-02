'use client';

import { cn } from '@/lib/utils';

export interface MnSwotProps {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

const quadrants = [
  { key: 'strengths', label: 'Strengths', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  { key: 'weaknesses', label: 'Weaknesses', color: 'bg-red-500/15 text-red-700 dark:text-red-400' },
  { key: 'opportunities', label: 'Opportunities', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  { key: 'threats', label: 'Threats', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
] as const;

/**
 * SWOT Analysis 2x2 quadrant grid.
 *
 * Color-coded quadrants using semantic color tokens.
 * Each quadrant lists items with accessible labeling.
 */
export function MnSwot({
  strengths,
  weaknesses,
  opportunities,
  threats,
  ariaLabel = 'SWOT Analysis',
  className,
}: MnSwotProps) {
  const data: Record<string, string[]> = {
    strengths,
    weaknesses,
    opportunities,
    threats,
  };

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn('grid grid-cols-2 gap-px bg-border rounded-lg overflow-hidden', className)}
    >
      {quadrants.map((q) => (
        <div
          key={q.key}
          className={cn('p-4 min-h-[10rem] flex flex-col gap-2', q.color)}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider">
            {q.label}
          </h3>
          <ul className="space-y-1" aria-label={q.label}>
            {data[q.key].map((item, i) => (
              <li
                key={`${item}-${i}`}
                className="text-sm flex items-start gap-1.5"
              >
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                {item}
              </li>
            ))}
            {data[q.key].length === 0 && (
              <li className="text-xs opacity-50 italic">No items</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
