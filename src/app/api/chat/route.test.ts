import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for POST /api/chat route handler.
 *
 * Validates request body parsing, Zod validation errors,
 * and error responses for missing agents / unsupported providers.
 * The streamText call is mocked to avoid hitting real LLM APIs.
 */

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => ({ modelId: "gpt-4o" })),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: () =>
      new Response("streamed", {
        status: 200,
        headers: new Headers({ "Content-Type": "text/plain" }),
      }),
  })),
}));

vi.mock("@/lib/config-loader", () => ({
  loadAIConfig: vi.fn(() => ({
    defaultAgentId: "jervis",
    agents: [
      {
        id: "jervis",
        name: "Jervis",
        description: "Platform orchestrator for operations",
        provider: "openai" as const,
        model: "gpt-4o",
        systemPrompt: "You are Jervis, the Convergio assistant.",
        apiRoute: "/api/chat",
        maxTokens: 4096,
      },
    ],
  })),
}));

function chatRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid JSON body", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: "not json{{{",
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error.code).toBe("INVALID_JSON");
  });

  it("returns 422 for missing messages field", async () => {
    const { POST } = await import("./route");
    const res = await POST(chatRequest({ agentId: "jervis" }));

    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.details).toBeDefined();
  });

  it("returns 422 for empty messages array", async () => {
    const { POST } = await import("./route");
    const res = await POST(chatRequest({ messages: [] }));

    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 for invalid message role", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({
        messages: [{ role: "moderator", content: "Hello" }],
      }),
    );

    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 for empty message content", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({
        messages: [{ role: "user", content: "" }],
      }),
    );

    expect(res.status).toBe(422);
  });

  it("streams response for valid request", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({
        messages: [
          { role: "user", content: "What is the current agent status?" },
        ],
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("59");
  });

  it("returns 503 when no agents configured", async () => {
    const configLoader = await import("@/lib/config-loader");
    vi.mocked(configLoader.loadAIConfig).mockReturnValueOnce({
      defaultAgentId: "jervis",
      agents: [],
    });

    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({
        messages: [{ role: "user", content: "Hello" }],
      }),
    );

    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error.code).toBe("NO_AGENT");
  });

  it("returns 501 for unsupported provider", async () => {
    const configLoader = await import("@/lib/config-loader");
    vi.mocked(configLoader.loadAIConfig).mockReturnValueOnce({
      defaultAgentId: "nasra",
      agents: [
        {
          id: "nasra",
          name: "Nasra",
          description: "Research agent for analysis tasks",
          provider: "anthropic" as const,
          model: "claude-sonnet-4-6",
          systemPrompt: "You are Nasra, a research assistant.",
        },
      ],
    });

    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({
        messages: [{ role: "user", content: "Analyze the deployment" }],
      }),
    );

    expect(res.status).toBe(501);
    const data = await res.json();
    expect(data.error.code).toBe("PROVIDER_ERROR");
  });
});
