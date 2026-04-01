import type { ActivityFeedBlock } from "@/types";
import { BlockWrapper } from "./block-wrapper";

const STATUS_DOT: Record<string, string> = {
  success: "bg-status-success",
  error: "bg-status-error",
  warning: "bg-status-warning",
  info: "bg-status-info",
};

const STATUS_LABEL: Record<string, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

export interface ActivityFeedProps extends ActivityFeedBlock {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Activity Feed block component.
 *
 * Renders a chronological event stream with colored status dots.
 * Use for: recent activity, audit trail, deployment log, agent event history.
 *
 * Supports loading skeleton, empty state (no items), and error fallback.
 * Themed: bg-card borders, works in all 4 themes.
 */
export function ActivityFeed({ loading, error, onRetry, items }: ActivityFeedProps) {
  return (
    <BlockWrapper
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={!loading && !error && items.length === 0}
      emptyMessage="No recent activity."
      skeletonVariant="feed"
    >
      <div className="space-y-2" aria-live="polite" aria-label="Activity feed">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-md border bg-card p-3 text-card-foreground text-sm">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[item.status ?? "info"]}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p><span className="sr-only">{STATUS_LABEL[item.status ?? "info"]}:</span> {item.text}</p>
              <p className="text-micro mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </BlockWrapper>
  );
}
