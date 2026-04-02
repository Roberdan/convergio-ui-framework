import { api } from "./client";
import type {
  DeepHealth,
  ReadinessCheck,
  KernelStatus,
  NotificationChannel,
} from "./types";

export async function getDeepHealth(): Promise<DeepHealth> {
  return api.get<DeepHealth>("/api/health/deep");
}

export async function getReadinessChecks(): Promise<ReadinessCheck[]> {
  return api.get<ReadinessCheck[]>("/api/node/readiness");
}

export async function getKernelStatus(): Promise<KernelStatus> {
  return api.get<KernelStatus>("/api/kernel/status");
}

export async function getNotificationChannels(): Promise<NotificationChannel[]> {
  return api.get<NotificationChannel[]>("/api/channels");
}
