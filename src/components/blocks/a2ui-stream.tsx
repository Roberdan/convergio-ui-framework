"use client";

/**
 * MnA2UIStream — live A2UI activity feed dashboard widget.
 *
 * Shows recent A2UI blocks as a color-coded timeline, auto-scrolling
 * to the latest entry. Color-coded by priority using semantic tokens.
 * Displays agent_id source on each entry.
 */

import { useEffect, useRef } from "react";
import { useA2UIBlocks } from "@/lib/a2ui";
import type { A2UIBlock } from "@/lib/a2ui/types";
import { BlockWrapper } from "./block-wrapper";

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-status-error",
  high: "bg-status-warning",
  normal: "bg-status-info",
  low: "bg-muted-foreground",
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
};

function blockSummary(block: A2UIBlock): string {
  return block.block.title ?? block.block.type;
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr.replace(" ", "T") + "Z");
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

export interface A2UIStreamProps {
  /** Max entries to show. Defaults to 20. */
  maxEntries?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function A2UIStream({
  maxEntries = 20,
  loading,
  error,
  onRetry,
}: A2UIStreamProps) {
  const blocks = useA2UIBlocks();
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = [...blocks]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, maxEntries);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [blocks.length]);

  return (
    <BlockWrapper
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={!loading && !error && sorted.length === 0}
      emptyMessage="No A2UI activity yet."
      skeletonVariant="feed"
    >
      <div
        ref={scrollRef}
        className="space-y-2 max-h-80 overflow-y-auto"
        aria-live="polite"
        aria-label="A2UI activity stream"
      >
        {sorted.map((block) => (
          <div
            key={block.block_id}
            className="flex items-start gap-3 rounded-md border bg-card p-3 text-card-foreground text-sm"
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[block.priority] ?? PRIORITY_DOT.normal}`}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p>
                <span className="sr-only">
                  {PRIORITY_LABEL[block.priority] ?? "Normal"}:
                </span>
                <span className="font-medium">{blockSummary(block)}</span>
                <span className="text-muted-foreground">
                  {" "}
                  &middot; {block.block.type}
                </span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-micro font-mono text-muted-foreground">
                  {block.agent_id}
                </span>
                <span className="text-micro text-muted-foreground">
                  {formatTime(block.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BlockWrapper>
  );
}
