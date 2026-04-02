"use client";

import type { OverviewStats } from "@/lib/api";
import { MnActivityFeed, MnDataTable } from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";

interface DashboardActivityProps {
  stats: OverviewStats;
}

type AgentRow = Record<string, unknown> & {
  name: string;
  status: string;
  type: string;
  tasks: number;
};

const agentColumns: DataTableColumn<AgentRow>[] = [
  { key: "name", label: "Agent", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "type", label: "Type" },
  { key: "tasks", label: "Tasks", align: "right", sortable: true },
];

export function DashboardActivity({ stats }: DashboardActivityProps) {
  const agents: AgentRow[] = (stats.activeAgentList ?? []).map((a) => ({
    name: a.name,
    status: a.status,
    type: a.type,
    tasks: a.taskCount,
  }));

  const activities = (stats.recentPlans ?? []).map((p) => ({
    agent: "system",
    action: p.status === "completed" ? "completed" : "updated",
    target: p.title,
    timestamp: p.updatedAt,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Active Agents
        </h2>
        {agents.length > 0 ? (
          <MnDataTable columns={agentColumns} data={agents} compact pageSize={5} />
        ) : (
          <p className="text-sm text-muted-foreground">No active agents</p>
        )}
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
          Recent Activity
        </h2>
        {activities.length > 0 ? (
          <MnActivityFeed items={activities} ariaLabel="Recent platform activity" />
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  );
}
