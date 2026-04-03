"use client";

import type { AgentHistoryEntry } from "@/lib/api";
import { MnActivityFeed } from "@/components/maranello";
import type { ActivityItem } from "@/components/maranello";
import { formatNumber } from "@/components/maranello/mn-format";

interface AgentHistoryProps {
  history: AgentHistoryEntry[] | null;
}

function toPriority(
  status: AgentHistoryEntry["status"],
): ActivityItem["priority"] {
  switch (status) {
    case "error":
      return "critical";
    case "running":
      return "high";
    default:
      return "normal";
  }
}

function formatAction(entry: AgentHistoryEntry): string {
  const parts = [entry.action];
  if (entry.durationMs != null) {
    parts.push(`(${(entry.durationMs / 1000).toFixed(1)}s)`);
  }
  if (entry.tokensUsed != null) {
    parts.push(`· ${formatNumber(entry.tokensUsed)} tokens`);
  }
  if (entry.cost != null && entry.cost > 0) {
    parts.push(`· $${entry.cost.toFixed(4)}`);
  }
  return parts.join(" ");
}

export function AgentHistory({ history }: AgentHistoryProps) {
  const items: ActivityItem[] = (history ?? []).map((entry) => ({
    agent: entry.agentName,
    action: formatAction(entry),
    target: entry.target,
    timestamp: entry.timestamp,
    priority: toPriority(entry.status),
  }));

  return (
    <div className="mt-4">
      <MnActivityFeed
        items={items}
        ariaLabel="Agent execution history"
      />
    </div>
  );
}
