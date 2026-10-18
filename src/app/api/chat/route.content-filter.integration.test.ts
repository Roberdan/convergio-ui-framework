import { describe, it, expect, vi, beforeEach } from "vitest";
import { APICallError } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import {
  CONTENT_FILTER_NOTICE_TEXT,
  PICTOGRAPHIC,
  chatRequest,
  contentFilterError,
  stalledStreamUntilAborted,
  streamThatErrorsMidStream,
  streamThatKeepsGoingAfterErrorPart,
  streamWithErrorPartAfterText,
  successStream,
} from "./chat-test-fixtures";

/**
 * Integration coverage for the Azure content-filter notice in POST /api/chat.
 *
 * Unlike route.test.ts (which mocks the whole `ai` module), this file leaves
 * `ai` and `APICallError` genuine: `streamText()`, its stream pipeline, and
 * its error propagation are the real AI SDK runtime. Only the model itself is
 * swapped for the SDK's own `ai/test` double (`MockLanguageModelV3`, the
 * official fake for `LanguageModelV3`), via a mocked `@ai-sdk/openai`
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

const SECRET_PROVIDER_MESSAGE =
  "RAW_AZURE_BODY_SECRET_should_never_reach_the_client";

async function postHi(): Promise<Response> {
  const { POST } = await import("./route");
  return POST(chatRequest({ messages: [{ role: "user", content: "Hi" }] }));
}

function expectNoticeWithoutLeak(text: string) {
  expect(text.endsWith(`\n\n${CONTENT_FILTER_NOTICE_TEXT}`)).toBe(true);
  expect(text).not.toMatch(PICTOGRAPHIC);
  expect(text).not.toContain(SECRET_PROVIDER_MESSAGE);
}

describe("POST /api/chat — content-filter integration (real ai + MockLanguageModelV3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("streams a normal successful response unchanged (control)", async () => {
    fakeModel = new MockLanguageModelV3({
      doStream: async () => successStream(["Hello ", "world"], "stop"),
    });
    const res = await postHi();

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello world");
  });

  it("appends the content-filter notice when finishReason is content-filter", async () => {
    fakeModel = new MockLanguageModelV3({
      doStream: async () =>
        successStream(["Partial answer before the cutoff."], "content-filter"),
    });
    const res = await postHi();

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.startsWith("Partial answer before the cutoff.")).toBe(true);
    expectNoticeWithoutLeak(text);
  });

  it("appends the notice when doStream() itself rejects with a real content_filter APICallError (HTTP 400 prompt rejection, no provider stream), without leaking the provider message", async () => {
    // The SDK's default onError logs the rejection server-side; keep CI output clean.
    const serverLog = vi.spyOn(console, "error").mockImplementation(() => {});
    fakeModel = new MockLanguageModelV3({
      doStream: async () => {
        throw contentFilterError(SECRET_PROVIDER_MESSAGE);
      },
    });
    const res = await postHi();
    const text = await res.text().finally(() => serverLog.mockRestore());

    expect(res.status).toBe(200);
    expect(text).toBe(`\n\n${CONTENT_FILTER_NOTICE_TEXT}`);
    expectNoticeWithoutLeak(text);
  });

  it("appends the content-filter notice when a real APICallError(content_filter) is thrown DURING the stream, without leaking the raw provider message", async () => {
    fakeModel = new MockLanguageModelV3({
      doStream: async () =>
        streamThatErrorsMidStream(
          ["Partial reply before the error. "],
          contentFilterError(SECRET_PROVIDER_MESSAGE),
        ),
    });
    const res = await postHi();

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.startsWith("Partial reply before the error. ")).toBe(true);
    expectNoticeWithoutLeak(text);
  });

  it("does NOT silently relabel an unrelated mid-stream error as a content-filter notice (explicit propagation, fail loud)", async () => {
    fakeModel = new MockLanguageModelV3({
      doStream: async () =>
        streamThatErrorsMidStream(
          ["Partial reply before the crash. "],
          new Error("SECRET_NONFILTER_UPSTREAM_DETAIL"),
        ),
    });
    const res = await postHi();

    expect(res.status).toBe(200);
    // The stream must error out (reject), not resolve with a masked
    // content-filter notice.
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
    const res = await postHi();

    expect(res.status).toBe(200);
    await expect(res.text()).rejects.toBeTruthy();
  });

  it("does NOT silently truncate when the provider emits an unrelated error part after partial output and finishes with finishReason error", async () => {
    // The SDK's default onError logs the error part server-side; keep CI output clean.
    const serverLog = vi.spyOn(console, "error").mockImplementation(() => {});
    fakeModel = new MockLanguageModelV3({
      doStream: async () =>
        streamWithErrorPartAfterText(["Partial reply. "], {
          message: "SECRET_NONFILTER_UPSTREAM_DETAIL",
          type: "server_error",
        }),
    });
    const res = await postHi();

    expect(res.status).toBe(200);
    await expect(
      res.text().finally(() => serverLog.mockRestore()),
    ).rejects.toBeTruthy();
  });

  it("aborts the provider call when it keeps streaming after an unrelated error part (issue #99)", async () => {
    // The SDK's default onError logs the error part server-side; keep CI output clean.
    const serverLog = vi.spyOn(console, "error").mockImplementation(() => {});
    let live: ReturnType<typeof streamThatKeepsGoingAfterErrorPart> | undefined;
    fakeModel = new MockLanguageModelV3({
      doStream: async ({ abortSignal }) => {
        live = streamThatKeepsGoingAfterErrorPart(
          { message: "SECRET_NONFILTER_UPSTREAM_DETAIL", type: "server_error" },
          abortSignal,
        );
        return { stream: live.stream };
      },
    });
    try {
      const res = await postHi();

      await expect(res.text()).rejects.toBeTruthy();
      expect(live?.state.aborted).toBe(true);
    } finally {
      live?.stop();
      serverLog.mockRestore();
    }
  });

  it("forwards client cancellation to the provider call while a read is still pending on a stalled stream", async () => {
    let providerSignal: AbortSignal | undefined;
    fakeModel = new MockLanguageModelV3({
      doStream: async ({ abortSignal }) => {
        providerSignal = abortSignal;
        return stalledStreamUntilAborted("First words", abortSignal);
      },
    });
    const res = await postHi();
    const reader = res.body!.getReader();
    const first = await reader.read();
    expect(new TextDecoder().decode(first.value)).toBe("First words");

    const pendingRead = reader.read();
    await reader.cancel();

    await expect(pendingRead).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(providerSignal?.aborted).toBe(true);
  });
});
