import { api } from "./client";
import type { CoordinatorEvent, CoordinatorStatus } from "./types";

export async function getCoordinatorEvents(): Promise<CoordinatorEvent[]> {
  return api.get<CoordinatorEvent[]>("/api/coordinator/events");
}

export async function getCoordinatorStatus(): Promise<CoordinatorStatus> {
  return api.get<CoordinatorStatus>("/api/coordinator/status");
}
