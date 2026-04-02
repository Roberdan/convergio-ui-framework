'use client';

import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ActivityItem {
  agent: string;
  action: string;
  target: string;
  timestamp: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface MnActivityFeedProps {
  items: ActivityItem[];
  /** Auto-refresh callback. Called every `refreshInterval` ms. */
  onRefresh?: () => void;
  /** Refresh interval in ms. Default: 30000 (30s). 0 = disabled. */
  refreshInterval?: number;
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-secondary text-secondary-foreground',
  high: 'bg-status-warning/20 text-status-warning',
  critical: 'bg-status-error/20 text-status-error',
};

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  critical: 'Critical',
};

/** Group items by relative day: today, yesterday, older. */
function groupByDay(items: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  for (const item of items) {
    const dateStr = item.timestamp.slice(0, 10);
    let label: string;
    if (dateStr === todayStr) label = 'Today';
    else if (dateStr === yesterdayStr) label = 'Yesterday';
    else label = 'Older';

    const group = groups.get(label);
    if (group) group.push(item);
    else groups.set(label, [item]);
  }
  return groups;
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

/**
 * Enhanced activity feed with time grouping and priority badges.
 *
 * Groups items by today/yesterday/older. Supports auto-refresh
 * via onRefresh callback. Priority badges are color-coded and
 * screen-reader accessible.
 */
export function MnActivityFeed({
  items,
  onRefresh,
  refreshInterval = 30_000,
  ariaLabel = 'Activity feed',
  className,
}: MnActivityFeedProps) {
  const [refreshing, setRefreshing] = useState(false);

  const grouped = useMemo(() => groupByDay(items), [items]);

  // auto-refresh
  useEffect(() => {
    if (!onRefresh || refreshInterval <= 0) return;
    const id = setInterval(() => {
      setRefreshing(true);
      onRefresh();
      // visual indicator briefly
      setTimeout(() => setRefreshing(false), 600);
    }, refreshInterval);
    return () => clearInterval(id);
  }, [onRefresh, refreshInterval]);

  const handleManualRefresh = useCallback(() => {
    if (!onRefresh) return;
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  }, [onRefresh]);

  if (!items.length) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground', className)}>
        No activity to display.
      </div>
    );
  }

  return (
    <div
      aria-label={ariaLabel}
      aria-live="polite"
      className={cn('rounded-lg border bg-card', className)}
    >
      {/* header with refresh */}
      {onRefresh && (
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {refreshing ? 'Refreshing...' : 'Live feed'}
          </span>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-2 py-1"
            aria-label="Refresh feed"
          >
            Refresh
          </button>
        </div>
      )}

      {/* grouped items */}
      {Array.from(grouped.entries()).map(([label, group]) => (
        <div key={label}>
          <div className="sticky top-0 bg-muted/50 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
            {label}
          </div>
          <div className="divide-y">
            {group.map((item, i) => (
              <div
                key={`${item.timestamp}-${i}`}
                className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
                tabIndex={0}
                aria-label={`${item.agent} ${item.action} ${item.target} at ${formatTime(item.timestamp)}${item.priority ? `, priority: ${item.priority}` : ''}`}
              >
                {/* agent avatar placeholder */}
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {item.agent.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p>
                    <span className="font-medium text-card-foreground">{item.agent}</span>
                    <span className="text-muted-foreground"> {item.action} </span>
                    <span className="font-medium text-card-foreground">{item.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTime(item.timestamp)}
                  </p>
                </div>

                {/* priority badge */}
                {item.priority && item.priority !== 'normal' && (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.normal,
                    )}
                    aria-label={`Priority: ${PRIORITY_LABEL[item.priority]}`}
                  >
                    {PRIORITY_LABEL[item.priority]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
