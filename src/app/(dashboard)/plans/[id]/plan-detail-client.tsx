"use client";

import { useApiQuery } from "@/hooks";
import { plansApi } from "@/lib/api";
import type { PlanDetail, ExecutionTree } from "@/lib/api";
import {
  MnGantt,
  MnStepper,
  MnBadge,
  MnSpinner,
} from "@/components/maranello";
import type { GanttTask } from "@/components/maranello";
import { ArrowLeft, Play } from "lucide-react";
import { useState } from "react";

interface PlanDetailClientProps {
  planId: string;
  initialPlan: PlanDetail | null;
  initialTree: ExecutionTree | null;
}

function planTaskToGantt(task: PlanDetail["tasks"][number]): GanttTask {
  return {
    id: task.id,
    title: task.title,
    start: task.start ?? new Date().toISOString(),
    end: task.end ?? new Date(Date.now() + 86400000).toISOString(),
    status: task.status === "done" ? "completed" : task.status === "in_progress" ? "active" : "planned",
    progress: task.status === "done" ? 100 : task.status === "in_progress" ? 50 : 0,
    dependencies: task.dependencies,
    children: task.children?.map(planTaskToGantt),
  };
}

export function PlanDetailClient({
  planId,
  initialPlan,
  initialTree,
}: PlanDetailClientProps) {
  const [starting, setStarting] = useState(false);
  const { data: plan } = useApiQuery(
    () => plansApi.getPlanContext(planId),
    { pollInterval: 10000 },
  );

  const detail = plan ?? initialPlan;

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading plan..." />
      </div>
    );
  }

  const toneMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    completed: "success",
    in_progress: "info",
    pending: "neutral",
    failed: "danger",
    cancelled: "warning",
  };

  const steps = (detail.tasks ?? []).map((t) => ({
    label: t.title,
    description: t.status,
  }));
  const currentStep = steps.findIndex(
    (_, i) => detail.tasks[i]?.status === "in_progress",
  );

  const ganttTasks = (detail.tasks ?? []).map(planTaskToGantt);

  async function handleStart() {
    setStarting(true);
    try {
      await plansApi.startPlan(planId);
    } catch {
      // handled by polling
    }
    setStarting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a
          href="/plans"
          className="rounded-md p-2 hover:bg-muted transition-colors"
          aria-label="Back to plans"
        >
          <ArrowLeft className="size-5" />
        </a>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1>{detail.title}</h1>
            <MnBadge
              label={detail.status}
              tone={toneMap[detail.status] ?? "neutral"}
            />
          </div>
          {detail.description && (
            <p className="text-caption mt-1">{detail.description}</p>
          )}
        </div>
        {detail.status === "pending" && (
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Play className="size-4" />
            {starting ? "Starting..." : "Start Plan"}
          </button>
        )}
      </div>

      {steps.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Progress
          </h2>
          <MnStepper
            steps={steps}
            currentStep={currentStep >= 0 ? currentStep : 0}
          />
        </div>
      )}

      {ganttTasks.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
            Timeline
          </h2>
          <MnGantt tasks={ganttTasks} showToday />
        </div>
      )}
    </div>
  );
}
