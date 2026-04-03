/* ── Mesh extended types ── */

export interface MeshSyncStatus {
  state: 'synced' | 'syncing' | 'diverged' | 'offline';
  lastSync: string;
  vectorClock: Record<string, number>;
  pendingOps: number;
  conflictsResolved: number;
}

export interface MeshDiagnosticEntry {
  id: string;
  category: 'network' | 'sync' | 'resource' | 'security';
  severity: 'ok' | 'warning' | 'critical';
  message: string;
  nodeId?: string;
  timestamp: string;
}

export interface MeshDiagnostics {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  entries: MeshDiagnosticEntry[];
  checkedAt: string;
}

export interface MeshNodeTraffic {
  nodeId: string;
  label: string;
  bytesIn: number;
  bytesOut: number;
  latencyMs: number;
  connections: number;
}

export interface MeshTraffic {
  totalBytesIn: number;
  totalBytesOut: number;
  requestsPerSecond: number;
  activeConnections: number;
  nodeTraffic: MeshNodeTraffic[];
}
