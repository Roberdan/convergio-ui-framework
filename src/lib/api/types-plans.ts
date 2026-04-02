// Plan-related API types

export interface PlanSummary {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  progress: number;
}

export interface PlanDetail extends PlanSummary {
  description: string;
  tasks: PlanTask[];
  metadata: Record<string, unknown>;
}

export interface PlanTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'done' | 'failed';
  assignee?: string;
  start?: string;
  end?: string;
  dependencies?: string[];
  children?: PlanTask[];
}

export interface ExecutionTree {
  planId: string;
  root: PlanTask;
}

export interface CreatePlanRequest {
  title: string;
  description?: string;
  tasks?: { title: string; assignee?: string }[];
}
