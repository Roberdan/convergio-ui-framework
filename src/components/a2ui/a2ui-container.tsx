"use client";

/**
 * A2UIContainer — filters and renders A2UI blocks for a given page/position.
 *
 * Placed in the app shell to show agent-pushed blocks at the top of the
 * main content area. Filters by target_page (null = all pages) and
 * target_position.
 */

import { useA2UIBlocks } from "@/lib/a2ui";
import { useA2UIClient } from "@/lib/a2ui/client";
import { A2UIBlockRenderer } from "./block-renderer";
import type { A2UIBlock } from "@/lib/a2ui/types";

interface A2UIContainerProps {
  /** Current page path for filtering (e.g. "/dashboard"). */
  currentPage: string;
  /** Position filter. Defaults to "top". */
  position?: "top" | "bottom" | "sidebar";
}

function matchesPage(block: A2UIBlock, page: string): boolean {
  return block.target.page === null || block.target.page === page;
}

function matchesPosition(
  block: A2UIBlock,
  position: string
): boolean {
  return (
    block.target.position === null || block.target.position === position
  );
}

/** Sort by priority weight (critical first), then by created_at desc. */
const PRIORITY_WEIGHT: Record<string, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function sortBlocks(a: A2UIBlock, b: A2UIBlock): number {
  const pa = PRIORITY_WEIGHT[a.priority] ?? 2;
  const pb = PRIORITY_WEIGHT[b.priority] ?? 2;
  if (pa !== pb) return pa - pb;
  return b.created_at.localeCompare(a.created_at);
}

export function A2UIContainer({
  currentPage,
  position = "top",
}: A2UIContainerProps) {
  useA2UIClient();
  const blocks = useA2UIBlocks();

  const filtered = blocks
    .filter(
      (b) =>
        b.status === "active" &&
        matchesPage(b, currentPage) &&
        matchesPosition(b, position)
    )
    .sort(sortBlocks);

  if (filtered.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      aria-label="Agent notifications"
    >
      {filtered.slice(0, 3).map((block) => (
        <A2UIBlockRenderer key={block.block_id} block={block} />
      ))}
    </div>
  );
}
