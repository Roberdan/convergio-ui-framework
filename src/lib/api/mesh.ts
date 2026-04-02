import { api } from "./client";
import type {
  MeshTopology,
  MeshMetrics,
  HeartbeatStatus,
  PeerInfo,
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
