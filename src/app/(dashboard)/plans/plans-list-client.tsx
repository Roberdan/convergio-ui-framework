"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks";
import { plansApi } from "@/lib/api";
import type { PlanSummary } from "@/lib/api";
import {
  MnDataTable,
  MnBadge,
  MnPipelineRanking,
  MnSpinner,
} from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";
import { CreatePlanDialog } from "./create-plan-dialog";

interface PlansListClientProps {
  initialPlans: PlanSummary[] | null;
}

type PlanRow = Record<string, unknown> & {
  id: string;
  title: string;
  status: string;
  taskCount: number;
  progress: number;
  updatedAt: string;
};

const columns: DataTableColumn<PlanRow>[] = [
  { key: "title", label: "Plan", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (val) => {
      const toneMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
        completed: "success",
        in_progress: "info",
        pending: "neutral",
        failed: "danger",
        cancelled: "warning",
      };
      return <MnBadge label={String(val)} tone={toneMap[String(val)] ?? "neutral"} />;
    },
  },
  { key: "taskCount", label: "Tasks", align: "right", sortable: true },
  { key: "progress", label: "Progress", align: "right", sortable: true },
  { key: "updatedAt", label: "Updated", sortable: true },
];

export function PlansListClient({ initialPlans }: PlansListClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const { data: plans, loading, refetch } = useApiQuery(
    () => plansApi.listPlans(),
    { pollInterval: 10000 },
  );

  const planList = plans ?? initialPlans;

  if (!planList && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading plans..." />
      </div>
    );
  }

  const rows: PlanRow[] = (planList ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    taskCount: p.taskCount,
    progress: p.progress,
    updatedAt: new Date(p.updatedAt).toLocaleDateString(),
  }));

  const pipelineStages = [
    { name: "Pending", count: rows.filter((r) => r.status === "pending").length },
    { name: "In Progress", count: rows.filter((r) => r.status === "in_progress").length },
    { name: "Completed", count: rows.filter((r) => r.status === "completed").length },
    { name: "Failed", count: rows.filter((r) => r.status === "failed").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Plans</h1>
          <p className="text-caption mt-1">Manage execution plans</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Create Plan
        </button>
      </div>

      <MnPipelineRanking stages={pipelineStages} ariaLabel="Plan pipeline" />

      <div className="rounded-lg border border-border bg-card p-4">
        <MnDataTable
          columns={columns}
          data={rows}
          pageSize={10}
          onRowClick={(row) => {
            window.location.href = `/plans/${row.id}`;
          }}
          emptyMessage="No plans found. Create one to get started."
        />
      </div>

      {showCreate && (
        <CreatePlanDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
