/* ── Operations extended types ── */

export interface Worker {
  id: string;
  agent_id: string;
  agent_type: string;
  host: string;
  model: string;
  status: string;
  started_at: string;
  plan_id?: string;
  task_db_id?: string;
  description?: string;
}

export interface WorkersResponse {
  workers: Worker[];
  count: number;
  ok: boolean;
}

export interface WorkersStatus {
  total: number;
  active: number;
  idle: number;
  offline: number;
  error: number;
}

export interface RollbackSnapshot {
  id: string;
  label: string;
  createdAt: string;
  size: number;
  version: string;
  status: 'available' | 'expired' | 'restoring';
}

export interface RunLogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface RunTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

export interface RunMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgTaskDuration: number;
}

export interface RunDetail {
  id: string;
  planId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  logs: RunLogEntry[];
  tasks: RunTask[];
  metrics: RunMetrics;
}
