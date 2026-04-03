"use client";

import { useMemo, useCallback } from "react";
import { useApiQuery } from "@/hooks";
import { coordinatorApi } from "@/lib/api";
import type { CoordinatorEvent, CoordinatorStatus } from "@/lib/api";
import {
  MnActivityFeed,
  MnDashboardStrip,
  MnBadge,
  MnSpinner,
} from "@/components/maranello";
import type { ActivityItem, StripMetric } from "@/components/maranello";

interface ActivityClientProps {
  initialEvents: CoordinatorEvent[] | null;
  initialStatus: CoordinatorStatus | null;
}

function toActivityItem(e: CoordinatorEvent): ActivityItem {
  return {
    agent: e.agent,
    action: e.action,
    target: e.target,
    timestamp: e.timestamp,
    priority: e.priority,
  };
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function ActivityClient({
  initialEvents,
  initialStatus,
}: ActivityClientProps) {
  const { data: events, refetch: refetchEvents } = useApiQuery(
    () => coordinatorApi.getCoordinatorEvents(),
    { pollInterval: 15_000 },
  );
  const { data: status } = useApiQuery(
    () => coordinatorApi.getCoordinatorStatus(),
    { pollInterval: 15_000 },
  );

  const eventList = Array.isArray(events) ? events : Array.isArray(initialEvents) ? initialEvents : null;
  const coordStatus = status ?? initialStatus;

  const activityItems: ActivityItem[] = useMemo(
    () => (eventList ?? []).map(toActivityItem),
    [eventList],
  );

  const stripMetrics: StripMetric[] = useMemo(() => {
    if (!coordStatus) return [];
    return [
      {
        label: "State",
        value: coordStatus.state,
        trend: coordStatus.state === "running" ? "up" : "down",
      },
      { label: "Active Agents", value: coordStatus.activeAgents },
      { label: "Queued", value: coordStatus.queuedTasks },
      { label: "Completed Today", value: coordStatus.completedToday, trend: "up" },
      { label: "Uptime", value: formatUptime(coordStatus.uptime) },
    ];
  }, [coordStatus]);

  const handleRefresh = useCallback(() => {
    refetchEvents();
  }, [refetchEvents]);

  if (!eventList && !coordStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Connecting to coordinator..." />
      </div>
    );
  }

  const stateBadgeTone = coordStatus?.state === "running"
    ? "success"
    : coordStatus?.state === "paused"
      ? "warning"
      : "danger";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Activity</h1>
          <p className="text-caption mt-1">
            Real-time event stream across all agents and plans.
          </p>
        </div>
        {coordStatus && (
          <MnBadge
            tone={stateBadgeTone as "success" | "warning" | "danger"}
            label={coordStatus.state}
          />
        )}
      </div>

      {stripMetrics.length > 0 && (
        <MnDashboardStrip
          metrics={stripMetrics}
          ariaLabel="Coordinator metrics"
        />
      )}

      <MnActivityFeed
        items={activityItems}
        onRefresh={handleRefresh}
        refreshInterval={30_000}
        ariaLabel="Coordinator events"
      />
    </div>
  );
}
