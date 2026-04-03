'use client';

import { cn } from '@/lib/utils';
import { useCallback, useMemo, useState } from 'react';
import { formatDateTime } from './mn-format';

export interface AuditEntry {
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
}

export interface MnAuditLogProps {
  entries: AuditEntry[];
  /** Max visible entries before virtual scroll kicks in */
  maxVisible?: number;
  ariaLabel?: string;
  className?: string;
}

const formatTs = formatDateTime;

/**
 * Chronological audit log with filtering.
 *
 * Filterable by actor or action via text input.
 * Virtualized: only renders maxVisible entries at a time
 * with a "Load more" button for performance.
 */
export function MnAuditLog({
  entries,
  maxVisible = 50,
  ariaLabel = 'Audit log',
  className,
}: MnAuditLogProps) {
  const [filter, setFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(maxVisible);

  const filtered = useMemo(() => {
    if (!filter.trim()) return entries;
    const q = filter.toLowerCase();
    return entries.filter(
      (e) =>
        e.actor.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q),
    );
  }, [entries, filter]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((c) => c + maxVisible);
  }, [maxVisible]);

  if (!entries.length) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground', className)}>
        No audit entries.
      </div>
    );
  }

  return (
    <div
      aria-label={ariaLabel}
      className={cn('rounded-lg border bg-card', className)}
    >
      {/* filter */}
      <div className="border-b px-4 py-2.5">
        <label className="sr-only" htmlFor="audit-filter">
          Filter audit log
        </label>
        <input
          id="audit-filter"
          type="text"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setVisibleCount(maxVisible);
          }}
          placeholder="Filter by actor, action, or target..."
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* entries */}
      <div className="divide-y max-h-[28rem] overflow-y-auto">
        {visible.map((entry, i) => (
          <div
            key={`${entry.timestamp}-${i}`}
            className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors"
            tabIndex={0}
            aria-label={`${formatTs(entry.timestamp)}: ${entry.actor} ${entry.action} ${entry.target}`}
          >
            {/* timestamp */}
            <span className="shrink-0 w-36 text-xs text-muted-foreground font-mono">
              {formatTs(entry.timestamp)}
            </span>

            {/* actor badge */}
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
              {entry.actor}
            </span>

            {/* action + target */}
            <span className="flex-1 min-w-0">
              <span className="text-muted-foreground">{entry.action}</span>{' '}
              <span className="font-medium text-card-foreground">
                {entry.target}
              </span>
              {entry.detail && (
                <span className="block text-xs text-muted-foreground mt-0.5 truncate">
                  {entry.detail}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* load more / count */}
      <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {visible.length} of {filtered.length} entries
          {filter && ` (filtered from ${entries.length})`}
        </span>
        {hasMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-2 py-1"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
