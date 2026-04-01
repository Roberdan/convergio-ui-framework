import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BlockWrapper } from "./block-wrapper";
import type { KpiCardBlock } from "@/types";

export interface KpiCardProps extends KpiCardBlock {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * KPI Card block component.
 *
 * Renders a single headline metric with label, value, and optional trend.
 * Use at the top of dashboard pages in rows of 3-4 to show key numbers.
 *
 * Supports loading skeleton, error fallback, and retry via BlockWrapper.
 * Themed: bg-card, text-card-foreground. Works in all 4 themes.
 */
export function KpiCard({ loading, error, onRetry, ...props }: KpiCardProps) {
  const { label, value, change, trend } = props;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-status-success" : trend === "down" ? "text-status-error" : "text-muted-foreground";
  const trendLabel = trend === "up" ? "Trending up" : trend === "down" ? "Trending down" : "No change";

  return (
    <BlockWrapper loading={loading} error={error} onRetry={onRetry} skeletonVariant="card">
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <p className="text-label text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-heading text-2xl font-bold">{value}</span>
          {change && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <TrendIcon className={`h-3 w-3 ${trendColor}`} aria-hidden="true" />
              <span className="sr-only">{trendLabel}:</span>
              {change}
            </Badge>
          )}
        </div>
      </div>
    </BlockWrapper>
  );
}
