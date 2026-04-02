"use client";

import type { AgentSummary, AgentCatalogEntry, AgentSession } from "@/lib/api";
import { MnDataTable, MnBadge } from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";

interface AgentTableProps {
  agents: AgentSummary[];
  catalog?: AgentCatalogEntry[] | null;
  sessions?: AgentSession[] | null;
}

type AgentRow = Record<string, unknown> & {
  id: string;
  name: string;
  type: string;
  status: string;
  model: string;
  tasks: number;
};

const columns: DataTableColumn<AgentRow>[] = [
  { key: "name", label: "Agent", sortable: true },
  { key: "type", label: "Type", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (val) => {
      const toneMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
        active: "success",
        idle: "neutral",
        error: "danger",
        offline: "warning",
      };
      return <MnBadge label={String(val)} tone={toneMap[String(val)] ?? "neutral"} />;
    },
  },
  { key: "model", label: "Model" },
  { key: "tasks", label: "Tasks", align: "right", sortable: true },
];

export function AgentTable({ agents, sessions }: AgentTableProps) {
  const rows: AgentRow[] = agents.map((a) => {
    const session = sessions?.find((s) => s.agentId === a.id);
    return {
      id: a.id,
      name: a.name,
      type: a.type,
      status: session ? session.status : a.status,
      model: a.model ?? "unknown",
      tasks: a.taskCount,
    };
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnDataTable
        columns={columns}
        data={rows}
        pageSize={10}
        emptyMessage="No agents registered"
      />
    </div>
  );
}
