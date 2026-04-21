'use client';

import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { formatTime } from '../shared/mn-format';

export interface ActivityItem {
  /** Optional stable id. When omitted, a composite of agent/action/target/timestamp is used. */
  id?: string;
  agent: string;
  action: string;
  target: string;
  timestamp: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

function itemKey(item: ActivityItem): string {
  return (
    item.id ??
    `${item.timestamp}|${item.agent}|${item.action}|${item.target}`
  );
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

/**
 * Group items by relative day: today, yesterday, older.
 *
 * Takes the `now` date as a parameter so callers can fix it to `null` during
 * SSR (everything lands in "Older") and then swap to a client-resolved date
 * after mount to avoid a hydration mismatch between UTC server output and
 * local-timezone client output.
 */
function groupByDay(
  items: ActivityItem[],
  now: Date | null,
): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>();

  let todayStr: string | null = null;
  let yesterdayStr: string | null = null;
  if (now) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    todayStr = `${y}-${m}-${d}`;
    const prev = new Date(now);
    prev.setDate(prev.getDate() - 1);
    const py = prev.getFullYear();
    const pm = String(prev.getMonth() + 1).padStart(2, '0');
    const pd = String(prev.getDate()).padStart(2, '0');
    yesterdayStr = `${py}-${pm}-${pd}`;
  }

  for (const item of items) {
    const dateStr = item.timestamp.slice(0, 10);
    let label: string;
    if (todayStr && dateStr === todayStr) label = 'Today';
    else if (yesterdayStr && dateStr === yesterdayStr) label = 'Yesterday';
    else label = 'Older';

    const group = groups.get(label);
    if (group) group.push(item);
    else groups.set(label, [item]);
  }
  return groups;
}

// formatTime imported from mn-format.ts

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
  const t = useLocale("activityFeed");
  const [refreshing, setRefreshing] = useState(false);
  // Server returns false, client returns true on first render post-mount.
  // Combining this with a client-only Date() call gives deterministic SSR
  // output and a stable hydration, while avoiding setState-in-effect.
  const hasMounted = useSyncExternalStore<boolean>(
    () => () => {},
    () => true,
    () => false,
  );

  const grouped = useMemo(
    () => groupByDay(items, hasMounted ? new Date() : null),
    [items, hasMounted],
  );

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
        {t.noActivity}
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
            {refreshing ? t.refreshing : t.liveFeed}
          </span>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-2 py-1"
            aria-label={t.refreshFeed}
          >
            {t.refresh}
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
            {group.map((item) => (
              <div
                key={itemKey(item)}
                role="group"
                aria-label={`${item.agent} ${item.action} ${item.target} at ${formatTime(item.timestamp)}${item.priority ? `, priority: ${item.priority}` : ''}`}
                className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted/30 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring"
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
