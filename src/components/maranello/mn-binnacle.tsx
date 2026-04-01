'use client';

import { cn } from '@/lib/utils';
import { useCallback, useMemo, useState } from 'react';

export interface BinnacleEntry {
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
}

export interface MnBinnacleProps {
  entries: BinnacleEntry[];
  /** Max entries to display before scrolling. Default: 50 */
  maxVisible?: number;
  ariaLabel?: string;
  className?: string;
}

const SEVERITY_STYLES: Record<BinnacleEntry['severity'], string> = {
  info: 'bg-primary/20',
  warning: 'bg-status-warning/30',
  error: 'bg-status-error/30',
  critical: 'bg-status-error/60',
};

const SEVERITY_LABEL: Record<BinnacleEntry['severity'], string> = {
  info: 'Info',
  warning: 'Warning',
  error: 'Error',
  critical: 'Critical',
};

type SeverityFilter = BinnacleEntry['severity'] | 'all';

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts;
  }
}

/**
 * Ship's log / event recorder.
 *
 * Displays timestamped entries sorted newest-first with a
 * severity-colored sidebar. Filterable by severity level.
 * Scrollable with keyboard navigation.
 */
export function MnBinnacle({
  entries,
  maxVisible = 50,
  ariaLabel = 'Event log',
  className,
}: MnBinnacleProps) {
  const [filter, setFilter] = useState<SeverityFilter>('all');

  const sorted = useMemo(
    () =>
      [...entries]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .filter((e) => filter === 'all' || e.severity === filter)
        .slice(0, maxVisible),
    [entries, filter, maxVisible],
  );

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as SeverityFilter);
  }, []);

  if (!entries.length) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground', className)}>
        No log entries.
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-lg border bg-card', className)}
      aria-label={ariaLabel}
    >
      {/* filter bar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {sorted.length} of {entries.length} entries
        </span>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filter:</span>
          <select
            value={filter}
            onChange={handleFilterChange}
            className="rounded border bg-background px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Filter by severity"
          >
            <option value="all">All</option>
            {Object.entries(SEVERITY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* entries */}
      <div
        className="max-h-80 divide-y overflow-y-auto"
        role="log"
        aria-live="polite"
      >
        {sorted.map((entry, i) => (
          <div
            key={`${entry.timestamp}-${i}`}
            className="flex text-sm"
            tabIndex={0}
            aria-label={`${SEVERITY_LABEL[entry.severity]}: ${entry.source} — ${entry.message}, ${formatTimestamp(entry.timestamp)}`}
          >
            {/* severity sidebar */}
            <div
              className={cn('w-1.5 shrink-0', SEVERITY_STYLES[entry.severity])}
              aria-hidden="true"
            />
            <div className="flex-1 px-3 py-2">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-card-foreground">{entry.source}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
              <p className="mt-0.5 text-muted-foreground">{entry.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
