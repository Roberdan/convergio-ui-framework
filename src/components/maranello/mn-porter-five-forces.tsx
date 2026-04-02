'use client';

import { cn } from '@/lib/utils';

export type ForceLevel = 'low' | 'medium' | 'high';

export interface Force {
  name: string;
  level: ForceLevel;
  notes?: string;
}

export interface MnPorterFiveForcesProps {
  /** Exactly 5 forces: rivalry, buyers, suppliers, new entrants, substitutes */
  forces: Force[];
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

const levelColor: Record<ForceLevel, string> = {
  low: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  medium: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  high: 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
};

const levelLabel: Record<ForceLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

/**
 * Porter's Five Forces diagram.
 *
 * Diamond/cross layout: center rivalry with 4 surrounding forces.
 * Color-coded by threat level. SVG connector lines.
 */
export function MnPorterFiveForces({
  forces,
  ariaLabel = "Porter's Five Forces",
  className,
}: MnPorterFiveForcesProps) {
  if (forces.length < 5) return null;

  /* Canonical order: [0]=rivalry(center), [1]=top, [2]=right, [3]=bottom, [4]=left */
  const [center, top, right, bottom, left] = forces;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn('relative w-full max-w-lg mx-auto', className)}
    >
      {/* SVG connectors */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
        aria-hidden="true"
      >
        <line x1="200" y1="140" x2="200" y2="60" className="stroke-border" strokeWidth="2" />
        <line x1="260" y1="200" x2="340" y2="200" className="stroke-border" strokeWidth="2" />
        <line x1="200" y1="260" x2="200" y2="340" className="stroke-border" strokeWidth="2" />
        <line x1="140" y1="200" x2="60" y2="200" className="stroke-border" strokeWidth="2" />
      </svg>

      <div className="grid grid-cols-3 grid-rows-3 gap-4 aspect-square p-4">
        {/* Row 1: empty, top force, empty */}
        <div />
        <ForceCard force={top} position="top" />
        <div />

        {/* Row 2: left, center rivalry, right */}
        <ForceCard force={left} position="left" />
        <ForceCard force={center} position="center" isCenter />
        <ForceCard force={right} position="right" />

        {/* Row 3: empty, bottom, empty */}
        <div />
        <ForceCard force={bottom} position="bottom" />
        <div />
      </div>
    </div>
  );
}

function ForceCard({
  force,
  position,
  isCenter = false,
}: {
  force: Force;
  position: string;
  isCenter?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 p-3 text-center transition-colors',
        levelColor[force.level],
        isCenter && 'shadow-md ring-1 ring-border',
      )}
      role="group"
      aria-label={`${force.name}: ${levelLabel[force.level]} threat`}
    >
      <span className="text-xs font-bold uppercase tracking-wider leading-tight">
        {force.name}
      </span>
      <span
        className={cn(
          'mt-1 text-[10px] font-semibold uppercase rounded-full px-2 py-0.5',
          force.level === 'high' && 'bg-red-500/20',
          force.level === 'medium' && 'bg-amber-500/20',
          force.level === 'low' && 'bg-emerald-500/20',
        )}
      >
        {levelLabel[force.level]}
      </span>
      {force.notes && (
        <span className="mt-1 text-[10px] opacity-70 leading-tight">
          {force.notes}
        </span>
      )}
    </div>
  );
}
