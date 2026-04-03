/* ── Mesh extended types ── */

export interface MeshHeartbeat {
  peer: string;
  last_seen_ago_s: number;
}

export interface MeshSyncPeer {
  peer: string;
  active: boolean;
  last_sync_ago_s: number;
  latency_ms: number;
  total_sent: number;
  total_received: number;
  total_applied: number;
}

export interface MeshTraffic {
  heartbeats: MeshHeartbeat[];
  sync_peers: MeshSyncPeer[];
  local_node: string;
  ts: string;
  ok: boolean;
}

export interface MeshSyncEventCount {
  status: string;
  count: number;
}

export interface MeshSyncLatency {
  db_sync_p50_ms: number;
  db_sync_p99_ms: number;
  targets: Record<string, unknown>;
}

export interface MeshSyncStatus {
  events: MeshSyncEventCount[];
  latency: MeshSyncLatency;
  ok: boolean;
}

export interface MeshDiagnostics {
  ok: boolean;
  online_peers: number;
  total_peers: number;
  uptime_secs: number;
  version: string;
  warnings: string[];
}
