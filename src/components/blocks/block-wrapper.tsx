import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Inbox } from "lucide-react";

/**
 * Shared block-level loading, empty, and error states.
 *
 * Wraps any block component to provide consistent UX feedback
 * when data is loading, absent, or failed to fetch.
 * Checks loading/error/empty in priority order and renders
 * the first matching state, or children if all clear.
 */

export interface BlockWrapperProps {
  /** Show loading skeleton instead of content. */
  loading?: boolean;
  /** Error object or message string. Renders error fallback. */
  error?: string | null;
  /** Whether the data set is empty. Renders empty message. */
  empty?: boolean;
  /** Message shown in empty state. */
  emptyMessage?: string;
  /** Skeleton variant controls the placeholder shape. */
  skeletonVariant?: "card" | "table" | "feed" | "list";
  /** Retry callback shown on error state. */
  onRetry?: () => void;
  children: React.ReactNode;
}

export function BlockWrapper({
  loading,
  error,
  empty,
  emptyMessage = "No data available.",
  skeletonVariant = "card",
  onRetry,
  children,
}: BlockWrapperProps) {
  if (loading) return <BlockSkeleton variant={skeletonVariant} />;
  if (error) return <BlockError message={error} onRetry={onRetry} />;
  if (empty) return <BlockEmpty message={emptyMessage} />;
  return <>{children}</>;
}

/* ── Loading skeletons ── */

function BlockSkeleton({ variant }: { variant: string }) {
  switch (variant) {
    case "table":
      return (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      );
    case "feed":
      return (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border bg-card p-3">
              <Skeleton className="mt-1 h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      );
    case "list":
      return (
        <div className="rounded-lg border bg-card divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-28" />
        </div>
      );
  }
}

/* ── Error fallback ── */

function BlockError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-card p-6 text-center">
      <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-destructive/90"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/* ── Empty state ── */

function BlockEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed bg-card p-8 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
