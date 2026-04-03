/* ── Operations extended types ── */

export interface Worker {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline' | 'error';
  currentTask?: string;
  uptime: number;
  cpu: number;
  memory: number;
  lastHeartbeat: string;
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
