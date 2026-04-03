"use client";

import type { ExecutionTree, PlanTask } from "@/lib/api";
import { MnOrgChart } from "@/components/maranello";
import type { OrgNode } from "@/components/maranello";

interface PlanExecutionTreeProps {
  tree: ExecutionTree;
  onTaskSelect?: (taskId: string) => void;
}

const TASK_STATUS_MAP: Record<string, OrgNode["status"]> = {
  done: "active",
  in_progress: "busy",
  submitted: "busy",
  pending: "inactive",
  failed: "error",
};

function planTaskToOrgNode(task: PlanTask): OrgNode {
  return {
    name: task.title,
    role: task.assignee ?? task.status,
    status: TASK_STATUS_MAP[task.status] ?? "inactive",
    children: task.children?.map(planTaskToOrgNode),
  };
}

function findTaskIdByName(
  task: PlanTask,
  name: string,
): string | null {
  if (task.title === name) return task.id;
  for (const child of task.children ?? []) {
    const found = findTaskIdByName(child, name);
    if (found) return found;
  }
  return null;
}

export function PlanExecutionTree({
  tree,
  onTaskSelect,
}: PlanExecutionTreeProps) {
  const orgTree = planTaskToOrgNode(tree.root);

  function handleNodeClick(node: OrgNode) {
    if (!onTaskSelect) return;
    const taskId = findTaskIdByName(tree.root, node.name);
    if (taskId) onTaskSelect(taskId);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
        Execution Tree
      </h2>
      <MnOrgChart
        tree={orgTree}
        onNodeClick={handleNodeClick}
        ariaLabel="Plan execution tree"
      />
    </div>
  );
}
