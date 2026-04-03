"use client";

import type { OverviewStats } from "@/lib/api";
import { MnDashboardStrip, MnFlipCounter } from "@/components/maranello";
import type { StripMetric, StripTrendZone } from "@/components/maranello";

interface DashboardMetricsProps {
  stats: OverviewStats;
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  const metrics: StripMetric[] = [
    {
      label: "Active Agents",
      value: stats.activeAgents,
      trend: stats.activeAgents > 0 ? "up" : "flat",
    },
    {
      label: "Running Plans",
      value: stats.runningPlans,
      trend: stats.runningPlans > 0 ? "up" : "flat",
    },
    {
      label: "Uptime",
      value: `${stats.uptime}%`,
      unit: "%",
      trend: stats.uptime >= 99 ? "up" : stats.uptime >= 95 ? "flat" : "down",
    },
  ];

  const trendZone: StripTrendZone = {
    type: "trend",
    title: "Recent",
    items: (stats.recentPlans ?? []).slice(0, 3).map((p) => ({
      label: p.title.slice(0, 12),
      value: `${p.progress}%`,
      data: [0, p.progress * 0.3, p.progress * 0.6, p.progress],
    })),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CounterCard
          label="Total Agents"
          value={stats.activeAgents + (stats.activeAgentList?.length ?? 0)}
          digits={3}
        />
        <CounterCard
          label="Running Plans"
          value={stats.runningPlans}
          digits={3}
        />
        <CounterCard
          label="Tasks Completed"
          value={stats.tasksCompleted}
          digits={5}
        />
      </div>
      <MnDashboardStrip
        metrics={metrics}
        zones={trendZone.items.length > 0 ? [trendZone] : undefined}
        ariaLabel="Platform metrics"
      />
    </div>
  );
}

function CounterCard({
  label,
  value,
  digits,
}: {
  label: string;
  value: number;
  digits: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <MnFlipCounter
        value={value}
        digits={digits}
        padZero={false}
        size="lg"
        label={`${label}: ${value}`}
      />
    </div>
  );
}
