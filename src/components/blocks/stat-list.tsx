import { Badge } from "@/components/ui/badge";
import { BlockWrapper } from "./block-wrapper";
import type { StatListBlock } from "@/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  error: "destructive",
  warning: "secondary",
  info: "outline",
};

export interface StatListProps extends StatListBlock {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Stat List block component.
 *
 * Renders a vertical list of label-value pairs with optional status badges.
 * Use for: system health, security policy status, feature flags, config summary.
 *
 * Supports loading skeleton, empty state, and error fallback.
 * Themed: bg-card, divide-border. Works in all 4 themes.
 */
export function StatList({ loading, error, onRetry, items }: StatListProps) {
  return (
    <BlockWrapper
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={!loading && !error && items.length === 0}
      emptyMessage="No stats available."
      skeletonVariant="list"
    >
      <div className="rounded-lg border bg-card text-card-foreground divide-y divide-border">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <p className="text-sm">{item.label}</p>
            {item.status ? (
              <Badge variant={STATUS_VARIANT[item.status] ?? "outline"}>{item.value}</Badge>
            ) : (
              <span className="text-sm font-mono text-muted-foreground">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </BlockWrapper>
  );
}
