import { describe, it, expect, vi, beforeEach } from "vitest";
import { APICallError } from "ai";
import { MockLanguageModelV3 } from "ai/test";

/**
 * Integration coverage for the Azure content-filter notice in POST /api/chat.
 *
 * Unlike route.test.ts (which mocks the whole `ai` module), this file leaves
 * `ai` and `APICallError` genuine: `streamText()`, its text-stream pipeline,
 * and its error propagation are the real AI SDK runtime. Only the model
 * itself is swapped for the SDK's own `ai/test` double (`MockLanguageModelV3`,
 * the official fake for `LanguageModelV3`), via a mocked `@ai-sdk/openai`
 * factory - no network calls, no provider credentials, no new dependencies
 * (`ai/test` ships inside the already-installed `ai` package).
 *
 * `fakeModel` is swapped per test; `@ai-sdk/openai`'s mock reads whichever
 * instance is current when `resolveModel()` calls `openai(...)`.
 */

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: () => ({ value: "authenticated.validsig" }) })),
}));

vi.mock("@/lib/session", () => ({
  verifyValue: vi.fn(() => Promise.resolve("authenticated")),
}));

let fakeModel: MockLanguageModelV3;

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => fakeModel),
  createOpenAI: vi.fn(() => vi.fn(() => fakeModel)),
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

const usage = {
  inputTokens: {
    total: 10,
    noCache: 10,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 5, text: 5, reasoning: undefined },
};

/** A real `LanguageModelV3StreamResult`-shaped stream of text deltas ending in `finish`. */
function successStream(
  textDeltas: string[],
  finishUnified: "stop" | "content-filter",
) {
  return {
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue({ type: "stream-start", warnings: [] });
        controller.enqueue({ type: "text-start", id: "t1" });
        for (const delta of textDeltas) {
          controller.enqueue({ type: "text-delta", id: "t1", delta });
        }
        controller.enqueue({ type: "text-end", id: "t1" });
        controller.enqueue({
          type: "finish",
          usage,
          finishReason: { unified: finishUnified, raw: finishUnified },
        });
        controller.close();
      },
    }),
  };
}

/**
 * A stream that emits some text then errors mid-stream (not before any
 * output). `start()` awaits a macrotask between enqueueing the text and
 * erroring, mirroring how real network chunks arrive as separate ticks - a
 * synchronous enqueue-then-error in the same tick would let the WHATWG
 * ReadableStream spec legitimately discard the unread queued chunk before any
 * consumer drains it, which is a stream-timing artifact, not a route.ts bug.
 */
function streamThatErrorsMidStream(textDeltas: string[], error: unknown) {
  return {
    stream: new ReadableStream({
      async start(controller) {
        controller.enqueue({ type: "stream-start", warnings: [] });
        controller.enqueue({ type: "text-start", id: "t1" });
        for (const delta of textDeltas) {
          controller.enqueue({ type: "text-delta", id: "t1", delta });
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
        controller.error(error);
      },
    }),
  };
}

describe("POST /api/chat — content-filter integration (real ai + MockLanguageModelV3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("streams a normal successful response unchanged (control)", async () => {
    fakeModel = new MockLanguageModelV3({
      doStream: async () => successStream(["Hello ", "world"], "stop"),
    });
    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({ messages: [{ role: "user", content: "Hi" }] }),
    );

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello world");
  });

  it("appends the content-filter notice when finishReason is content-filter", async () => {
    fakeModel = new MockLanguageModelV3({
      doStream: async () =>
        successStream(["Partial answer before the cutoff."], "content-filter"),
    });
    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({ messages: [{ role: "user", content: "Hi" }] }),
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Partial answer before the cutoff.");
    expect(text).toContain("content filter");
  });

  it("appends the content-filter notice when a real APICallError(content_filter) is thrown DURING the stream, without leaking the raw provider message", async () => {
    const secretProviderMessage =
      "RAW_AZURE_BODY_SECRET_should_never_reach_the_client";
    const realContentFilterError = new APICallError({
      message: secretProviderMessage,
      url: "https://example.openai.azure.com/openai/deployments/x/chat/completions",
      requestBodyValues: {},
      statusCode: 400,
      data: {
        error: { code: "content_filter", message: secretProviderMessage },
      },
    });
    fakeModel = new MockLanguageModelV3({
      doStream: async () =>
        streamThatErrorsMidStream(
          ["Partial reply before the error. "],
          realContentFilterError,
        ),
    });
    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({ messages: [{ role: "user", content: "Hi" }] }),
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Partial reply before the error.");
    expect(text).toContain("content filter");
    expect(text).not.toContain(secretProviderMessage);
  });

  it("does NOT silently relabel an unrelated mid-stream error as a content-filter notice (explicit propagation, fail loud)", async () => {
    const secretNonFilterMessage = "SECRET_NONFILTER_UPSTREAM_DETAIL";
    fakeModel = new MockLanguageModelV3({
      doStream: async () =>
        streamThatErrorsMidStream(
          ["Partial reply before the crash. "],
          new Error(secretNonFilterMessage),
        ),
    });
    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({ messages: [{ role: "user", content: "Hi" }] }),
    );

    expect(res.status).toBe(200);
    // The stream must error out (reject), not resolve with a masked
    // content-filter notice - and the rejection must not have leaked the
    // secret into a readable body anywhere along the way.
    await expect(res.text()).rejects.toBeTruthy();
  });

  it("does NOT silently relabel a non-content_filter APICallError as a content-filter notice", async () => {
    const otherAzureError = new APICallError({
      message: "deployment not found",
      url: "https://example.openai.azure.com/openai/deployments/x/chat/completions",
      requestBodyValues: {},
      statusCode: 404,
      data: { error: { code: "DeploymentNotFound" } },
    });
    fakeModel = new MockLanguageModelV3({
      doStream: async () =>
        streamThatErrorsMidStream(["Partial reply. "], otherAzureError),
    });
    const { POST } = await import("./route");
    const res = await POST(
      chatRequest({ messages: [{ role: "user", content: "Hi" }] }),
    );

    expect(res.status).toBe(200);
    await expect(res.text()).rejects.toBeTruthy();
  });
});
