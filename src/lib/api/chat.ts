import { api } from "./client";
import type {
  ChatSession,
  ChatMessageRequest,
  ChatMessageResponse,
  InferenceProvider,
} from "./types";

export async function createChatSession(agentId?: string): Promise<ChatSession> {
  return api.post<ChatSession>("/api/chat/session", { agentId });
}

export async function sendChatMessage(
  data: ChatMessageRequest,
): Promise<ChatMessageResponse> {
  return api.post<ChatMessageResponse>("/api/chat/message", data);
}

export function getChatStreamUrl(sessionId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8420";
  return `${base}/api/chat/stream/${sessionId}`;
}

export async function getInferenceProviders(): Promise<InferenceProvider[]> {
  return api.get<InferenceProvider[]>("/api/inference/status");
}
