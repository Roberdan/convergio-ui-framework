"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Dashboard-level error boundary.
 * Catches errors within dashboard routes and renders an inline
 * error panel with retry and navigation options.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-caption mt-1 max-w-sm text-center">
        {error.message || "An unexpected error occurred in this section."}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mt-2">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-3 mt-6">
        <Button onClick={reset}>Try Again</Button>
        <a
          href="/"
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Go to dashboard
        </a>
      </div>
    </div>
  );
}
