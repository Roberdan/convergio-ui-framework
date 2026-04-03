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
import { formatNumber } from "@/components/maranello/mn-format";

interface ActivityClientProps {
  initialEvents: CoordinatorEvent[] | null;
  initialStatus: CoordinatorStatus | null;
}

function toActivityItem(e: CoordinatorEvent): ActivityItem {
  return {
    agent: e.source_node ?? "unknown",
    action: e.event_type ?? "event",
    target: typeof e.payload === "object" && e.payload !== null
      ? JSON.stringify(e.payload).slice(0, 80)
      : String(e.payload ?? ""),
    timestamp: e.handled_at ?? new Date().toISOString(),
  };
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
        label: "Running",
        value: coordStatus.running ? "Yes" : "No",
        trend: coordStatus.running ? "up" as const : "down" as const,
      },
      { label: "PID", value: coordStatus.pid ?? "—" },
      { label: "Pending Events", value: formatNumber(coordStatus.pending_events ?? 0) },
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

  const stateBadgeTone = coordStatus?.running ? "success" : "danger";

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
            tone={stateBadgeTone as "success" | "danger"}
            label={coordStatus.running ? "running" : "stopped"}
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
