"use client";

import type { OverviewStats, TaskDistribution } from "@/lib/api";
import { MnKpiScorecard } from "@/components/maranello";
import type { KpiRow } from "@/components/maranello";

interface DashboardKpiProps {
  stats: OverviewStats;
  taskDist: TaskDistribution[] | null;
}

function buildKpiRows(
  stats: OverviewStats,
  taskDist: TaskDistribution[] | null,
): KpiRow[] {
  const totalTasks = taskDist?.reduce((s, t) => s + t.count, 0) ?? 0;
  const doneTasks =
    taskDist?.find((t) => t.status === "done" || t.status === "completed")
      ?.count ?? 0;
  const failedTasks =
    taskDist?.find((t) => t.status === "failed")?.count ?? 0;

  const rows: KpiRow[] = [
    {
      id: "active-agents",
      label: "Active Agents",
      target: 10,
      actual: stats.activeAgents,
      trend: [
        Math.max(1, stats.activeAgents - 3),
        Math.max(1, stats.activeAgents - 1),
        stats.activeAgents,
      ],
    },
    {
      id: "running-plans",
      label: "Running Plans",
      target: 5,
      actual: stats.runningPlans,
      trend: [
        Math.max(0, stats.runningPlans - 2),
        stats.runningPlans,
        stats.runningPlans,
      ],
    },
    {
      id: "tasks-completed",
      label: "Tasks Completed",
      target: totalTasks > 0 ? totalTasks : stats.tasksCompleted,
      actual: doneTasks > 0 ? doneTasks : stats.tasksCompleted,
      trend: [
        Math.max(0, stats.tasksCompleted - 10),
        Math.max(0, stats.tasksCompleted - 5),
        stats.tasksCompleted,
      ],
    },
    {
      id: "task-success-rate",
      label: "Task Success Rate",
      format: "percent",
      target: 95,
      actual:
        totalTasks > 0
          ? Math.round(((totalTasks - failedTasks) / totalTasks) * 100)
          : 100,
    },
    {
      id: "uptime",
      label: "Platform Uptime",
      format: "percent",
      target: 99.9,
      actual: stats.uptime,
      trend: [99, 99.5, stats.uptime],
    },
  ];

  return rows;
}

export function DashboardKpi({ stats, taskDist }: DashboardKpiProps) {
  const rows = buildKpiRows(stats, taskDist);

  return (
    <div>
      <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-3">
        KPI Scorecard
      </h2>
      <MnKpiScorecard rows={rows} ariaLabel="Platform KPI scorecard" />
    </div>
  );
}
