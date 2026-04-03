import { api } from "./client";
import type { CoordinatorEvent, CoordinatorStatus } from "./types";

interface CoordinatorEventsResponse {
  events?: CoordinatorEvent[];
  count?: number;
  ok?: boolean;
}

export async function getCoordinatorEvents(): Promise<CoordinatorEvent[]> {
  const data = await api.get<CoordinatorEventsResponse | CoordinatorEvent[]>(
    "/api/coordinator/events",
  );
  if (Array.isArray(data)) return data;
  return Array.isArray((data as CoordinatorEventsResponse)?.events)
    ? (data as CoordinatorEventsResponse).events!
    : [];
}

export async function getCoordinatorStatus(): Promise<CoordinatorStatus> {
  return api.get<CoordinatorStatus>("/api/coordinator/status");
}
