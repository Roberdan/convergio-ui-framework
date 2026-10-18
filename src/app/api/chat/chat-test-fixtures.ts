import { APICallError } from "ai";

/**
 * Shared fixtures for the chat route tests: the expected notice copy, a request
 * builder and `LanguageModelV3` stream builders for `ai/test`'s `MockLanguageModelV3`.
 * Test-only; not imported by application code.
 */

/** The user-visible copy: plain English with a text prefix, never an emoji. */
export const CONTENT_FILTER_NOTICE_TEXT =
  "Warning: This response was stopped by the content filter and could not be completed.";

export const PICTOGRAPHIC = new RegExp("\\p{Extended_Pictographic}", "u");

export function chatRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** A genuine Azure-shaped content-filter rejection: HTTP 400, `error.code`. */
export function contentFilterError(providerMessage: string): APICallError {
  return new APICallError({
    message: providerMessage,
    url: "https://example.openai.azure.com/openai/deployments/x/chat/completions",
    requestBodyValues: {},
    statusCode: 400,
    data: { error: { code: "content_filter", message: providerMessage } },
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
export function successStream(
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
export function streamThatErrorsMidStream(
  textDeltas: string[],
  error: unknown,
) {
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

/**
 * A provider stream that emits text, then an `error` part (how providers
 * report an error chunk inside an otherwise-200 response), then finishes
 * with finishReason "error". Unlike `controller.error()`, the stream itself
 * ends normally, so only the error part signals the failure.
 */
export function streamWithErrorPartAfterText(
  textDeltas: string[],
  error: unknown,
) {
  return {
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue({ type: "stream-start", warnings: [] });
        controller.enqueue({ type: "text-start", id: "t1" });
        for (const delta of textDeltas) {
          controller.enqueue({ type: "text-delta", id: "t1", delta });
        }
        controller.enqueue({ type: "error", error });
        controller.enqueue({ type: "text-end", id: "t1" });
        controller.enqueue({
          type: "finish",
          usage,
          finishReason: { unified: "error", raw: "error" },
        });
        controller.close();
      },
    }),
  };
}

/**
 * A provider stream that emits one text delta and then stalls. Like `fetch`,
 * it errors its body only when the request's abort signal fires, so a test
 * can observe whether client cancellation reaches the provider call.
 */
export function stalledStreamUntilAborted(
  firstDelta: string,
  abortSignal: AbortSignal | undefined,
) {
  return {
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue({ type: "stream-start", warnings: [] });
        controller.enqueue({ type: "text-start", id: "t1" });
        controller.enqueue({ type: "text-delta", id: "t1", delta: firstDelta });
        abortSignal?.addEventListener("abort", () =>
          controller.error(abortSignal.reason),
        );
      },
    }),
  };
}
