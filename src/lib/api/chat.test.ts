import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockPost = vi.fn();
vi.mock("./client", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
  ApiError: class extends Error {},
  createApiClient: vi.fn(),
}));

import {
  createChatSession,
  sendChatMessage,
  getChatStreamUrl,
  getInferenceProviders,
} from "./chat";

describe("chat API", () => {
  beforeEach(() => { mockGet.mockReset(); mockPost.mockReset(); });

  it("createChatSession posts to /api/chat/session", async () => {
    mockPost.mockResolvedValueOnce({ id: "sess-1" });
    const result = await createChatSession("jervis");
    expect(mockPost).toHaveBeenCalledWith("/api/chat/session", { agentId: "jervis" });
    expect(result).toEqual({ id: "sess-1" });
  });

  it("sendChatMessage posts to /api/chat/message", async () => {
    const msg = { sessionId: "s1", message: "Hello" };
    mockPost.mockResolvedValueOnce({ reply: "Hi there" });
    await sendChatMessage(msg);
    expect(mockPost).toHaveBeenCalledWith("/api/chat/message", msg);
  });

  it("getChatStreamUrl returns SSE URL", () => {
    const url = getChatStreamUrl("abc123");
    expect(url).toContain("/api/chat/stream/abc123");
  });

  it("getInferenceProviders extracts providers array", async () => {
    mockGet.mockResolvedValueOnce({ providers: [{ name: "openai", status: "active" }] });
    const result = await getInferenceProviders();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("openai");
  });

  it("getInferenceProviders returns empty on missing providers", async () => {
    mockGet.mockResolvedValueOnce({});
    const result = await getInferenceProviders();
    expect(result).toEqual([]);
  });
});
