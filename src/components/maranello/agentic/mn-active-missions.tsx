'use client';

import { cn } from '@/lib/utils';

export interface Mission {
  id: string;
  name: string;
  progress: number;
  status: 'active' | 'paused' | 'completed' | 'failed';
  agent: string;
}

export interface MnActiveMissionsProps {
  missions: Mission[];
  ariaLabel?: string;
  className?: string;
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-status-success/20 text-status-success',
  paused: 'bg-status-warning/20 text-status-warning',
  completed: 'bg-muted text-muted-foreground',
  failed: 'bg-status-error/20 text-status-error',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
};

const PROGRESS_COLOR: Record<string, string> = {
  active: 'var(--primary)',
  paused: 'var(--status-warning, hsl(38 92% 50%))',
  completed: 'var(--status-success, hsl(142 71% 45%))',
  failed: 'var(--status-error, hsl(0 84% 60%))',
};

/**
 * Active plan/mission tracker with progress bars and agent avatars.
 *
 * Shows each mission's progress, status badge, and assigned agent.
 * Progress bars are color-coded by status. Accessible via ARIA.
 */
export function MnActiveMissions({
  missions,
  ariaLabel = 'Active missions',
  className,
}: MnActiveMissionsProps) {
  if (!missions.length) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground', className)}>
        No active missions.
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn('rounded-lg border bg-card divide-y', className)}
    >
      {missions.map((m) => {
        const pct = Math.max(0, Math.min(100, m.progress));
        return (
          <div
            key={m.id}
            role="listitem"
            className="px-4 py-3 hover:bg-muted/30 transition-colors"
            tabIndex={0}
            aria-label={`${m.name}: ${pct}% ${STATUS_LABEL[m.status]}, agent ${m.agent}`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* agent avatar */}
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {m.agent.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm text-card-foreground truncate">
                  {m.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    STATUS_BADGE[m.status] ?? STATUS_BADGE.active,
                  )}
                >
                  {STATUS_LABEL[m.status] ?? m.status}
                </span>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {pct}%
                </span>
              </div>
            </div>

            {/* progress bar */}
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${m.name} progress`}
              className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor: PROGRESS_COLOR[m.status] ?? 'var(--primary)',
                }}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{m.agent}</span>
              <span className="font-mono text-[10px]">{m.id}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
