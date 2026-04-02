"use client";

import type { OverviewStats } from "@/lib/api";
import { MnDashboardStrip } from "@/components/maranello";
import type { StripMetric } from "@/components/maranello";

interface DashboardMetricsProps {
  stats: OverviewStats;
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  const metrics: StripMetric[] = [
    {
      label: "Active Agents",
      value: stats.activeAgents,
      trend: "up" as const,
    },
    {
      label: "Running Plans",
      value: stats.runningPlans,
      trend: "flat" as const,
    },
    {
      label: "Tasks Completed",
      value: stats.tasksCompleted,
      trend: "up" as const,
    },
    {
      label: "Uptime",
      value: `${stats.uptime}%`,
      unit: "%",
      trend: "up" as const,
    },
  ];

  return <MnDashboardStrip metrics={metrics} ariaLabel="Platform metrics" />;
}
