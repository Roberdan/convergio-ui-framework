import { api } from "./client";
import type { NotificationChannel } from "./types";

export async function getChannels(): Promise<NotificationChannel[]> {
  return api.get<NotificationChannel[]>("/api/channels");
}

export async function getChannelHealth(
  name: string,
): Promise<{ status: string; latencyMs?: number }> {
  return api.get(`/api/channels/${encodeURIComponent(name)}/health`);
}

export async function sendNotification(payload: {
  channel: string;
  title: string;
  message: string;
  type?: string;
}): Promise<{ ok: boolean }> {
  return api.post("/api/notify", payload);
}

export async function getMorningDigest(): Promise<{
  date: string;
  items: { title: string; summary: string }[];
}> {
  return api.get("/api/digest/morning");
}
