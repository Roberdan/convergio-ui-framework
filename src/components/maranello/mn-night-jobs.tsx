'use client';

import { cn } from '@/lib/utils';
import { formatDateTime } from './mn-format';

export interface NightJob {
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'success' | 'running' | 'failed' | 'skipped' | 'scheduled';
}

export interface MnNightJobsProps {
  jobs: NightJob[];
  ariaLabel?: string;
  className?: string;
}

const STATUS_BADGE: Record<string, string> = {
  success: 'bg-status-success/20 text-status-success',
  running: 'bg-primary/20 text-primary',
  failed: 'bg-status-error/20 text-status-error',
  skipped: 'bg-muted text-muted-foreground',
  scheduled: 'bg-secondary text-secondary-foreground',
};

const STATUS_LABEL: Record<string, string> = {
  success: 'Success',
  running: 'Running',
  failed: 'Failed',
  skipped: 'Skipped',
  scheduled: 'Scheduled',
};

const STATUS_ICON: Record<string, string> = {
  success: '\u2713',
  running: '\u25CB',
  failed: '\u2717',
  skipped: '\u2014',
  scheduled: '\u25F7',
};

const formatTs = formatDateTime;

/**
 * Night/scheduled job monitor.
 *
 * Displays cron schedule, last/next run times, and status.
 * Status is indicated by both color and icon for accessibility.
 */
export function MnNightJobs({
  jobs,
  ariaLabel = 'Scheduled jobs',
  className,
}: MnNightJobsProps) {
  if (!jobs.length) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground', className)}>
        No scheduled jobs.
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn('rounded-lg border bg-card divide-y', className)}
    >
      {jobs.map((job, i) => (
        <div
          key={`${job.name}-${i}`}
          role="listitem"
          className="px-4 py-3 hover:bg-muted/30 transition-colors"
          tabIndex={0}
          aria-label={`${job.name}: ${STATUS_LABEL[job.status]}, schedule ${job.schedule}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* status icon */}
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold',
                  STATUS_BADGE[job.status] ?? STATUS_BADGE.scheduled,
                )}
                aria-hidden="true"
              >
                {STATUS_ICON[job.status] ?? '?'}
              </span>
              <span className="font-medium text-sm text-card-foreground truncate">
                {job.name}
              </span>
            </div>

            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                STATUS_BADGE[job.status] ?? STATUS_BADGE.scheduled,
              )}
            >
              {STATUS_LABEL[job.status] ?? job.status}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="block text-[10px] uppercase tracking-wide font-medium">
                Schedule
              </span>
              <span className="font-mono">{job.schedule}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wide font-medium">
                Last run
              </span>
              <span>{formatTs(job.lastRun)}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wide font-medium">
                Next run
              </span>
              <span>{formatTs(job.nextRun)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
