import { api } from "./client";
import type {
  MeshTopology,
  MeshMetrics,
  HeartbeatStatus,
  PeerInfo,
  MeshSyncStatus,
  MeshDiagnostics,
  MeshTraffic,
} from "./types";

export async function getMeshTopology(): Promise<MeshTopology> {
  return api.get<MeshTopology>("/api/mesh");
}

export async function getMeshMetrics(): Promise<MeshMetrics> {
  return api.get<MeshMetrics>("/api/mesh/metrics");
}

export async function getHeartbeatStatus(): Promise<HeartbeatStatus[]> {
  return api.get<HeartbeatStatus[]>("/api/heartbeat/status");
}

export async function listPeers(): Promise<PeerInfo[]> {
  return api.get<PeerInfo[]>("/api/peers");
}

export async function getMeshSyncStatus(): Promise<MeshSyncStatus> {
  return api.get<MeshSyncStatus>("/api/mesh/sync-status");
}

export async function getMeshDiagnostics(): Promise<MeshDiagnostics> {
  return api.get<MeshDiagnostics>("/api/mesh/diagnostics");
}

export async function getMeshTraffic(): Promise<MeshTraffic> {
  return api.get<MeshTraffic>("/api/mesh/traffic");
}
