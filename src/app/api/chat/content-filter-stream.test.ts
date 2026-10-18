import { describe, it, expect } from "vitest";
import type { FinishReason, TextStreamPart, ToolSet } from "ai";
import {
  CONTENT_FILTER_NOTICE,
  toTextStreamResponseWithContentFilterNotice,
} from "./content-filter-stream";
import {
  CONTENT_FILTER_NOTICE_TEXT,
  PICTOGRAPHIC,
  contentFilterError,
} from "./chat-test-fixtures";

/**
 * Unit coverage for the response adapter behind POST /api/chat: the
 * content-filter notice, error propagation, backpressure and cancellation.
 * The real SDK path is covered by route.content-filter.integration.test.ts.
 */

type Part = TextStreamPart<ToolSet>;

const delta = (text: string): Part => ({ type: "text-delta", id: "t1", text });
const errorPart = (error: unknown): Part => ({ type: "error", error });
const SECRET = "RAW_PROVIDER_MESSAGE_must_not_reach_the_client";
const noOutput = () => Promise.reject(new Error("No output generated."));
const nextMacrotask = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Provider-side source with highWaterMark 0, so `reads` counts exactly the
 * parts the adapter asked for. After the parts it closes, errors, or stalls
 * forever like a hung provider.
 */
function source(
  parts: Part[],
  end: "close" | "stall" | { error: unknown } = "close",
) {
  const state = { reads: 0, cancelReason: undefined as unknown };
  let next = 0;
  const stream = new ReadableStream<Part>(
    {
      pull(controller) {
        state.reads += 1;
        if (next < parts.length) controller.enqueue(parts[next++]);
        else if (end === "stall") return new Promise<void>(() => {});
        else if (end === "close") controller.close();
        else controller.error(end.error);
      },
      cancel(reason) {
        state.cancelReason = reason;
      },
    },
    { highWaterMark: 0 },
  );
  return { stream, state };
}

/**
 * `streamText()`-shaped result mirroring the SDK views: `fullStream` carries
 * every part, while `textStream` keeps text deltas only and drops `error`
 * parts, so an adapter built on it would miss a prompt rejection. Like the
 * SDK getter, `finishReason` is produced lazily; reads are counted.
 */
function streamResult(
  stream: ReadableStream<Part>,
  finishReason: () => Promise<FinishReason> = async () => "stop",
) {
  const counts = { finishReason: 0 };
  const result = {
    fullStream: stream,
    get textStream() {
      return stream.pipeThrough(
        new TransformStream<Part, string>({
          transform(part, controller) {
            if (part.type === "text-delta") controller.enqueue(part.text);
          },
        }),
      );
    },
    get finishReason() {
      counts.finishReason += 1;
      return finishReason();
    },
  };
  return { result, counts };
}

function respond(
  { result }: ReturnType<typeof streamResult>,
  abortController = new AbortController(),
): Response {
  return toTextStreamResponseWithContentFilterNotice(result, abortController);
}

describe("toTextStreamResponseWithContentFilterNotice", () => {
  it("uses a plain English notice with a Warning: prefix and no emoji", () => {
    expect(CONTENT_FILTER_NOTICE).toBe(`\n\n${CONTENT_FILTER_NOTICE_TEXT}`);
    expect(CONTENT_FILTER_NOTICE).not.toMatch(PICTOGRAPHIC);
  });

  it("streams text deltas unchanged as text/plain and closes on a normal finish", async () => {
    const res = respond(
      streamResult(source([delta("Hello "), delta("world")]).stream),
    );

    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toBe("Hello world");
  });

  it("appends the notice when finishReason is content-filter", async () => {
    const res = respond(
      streamResult(
        source([delta("Partial answer.")]).stream,
        async () => "content-filter",
      ),
    );

    expect(await res.text()).toBe(`Partial answer.${CONTENT_FILTER_NOTICE}`);
  });

  it("appends the notice for a content_filter error part (prompt rejected before any output) without leaking it or reading finishReason", async () => {
    const parts: Part[] = [
      { type: "start" },
      errorPart(contentFilterError(SECRET)),
    ];
    const stream = streamResult(source(parts).stream, noOutput);

    const text = await respond(stream).text();

    expect(text).toBe(CONTENT_FILTER_NOTICE);
    expect(text).not.toContain(SECRET);
    expect(stream.counts.finishReason).toBe(0);
  });

  it("appends the notice when the stream errors mid-stream with a content_filter APICallError", async () => {
    const parts = source([delta("Partial reply. ")], {
      error: contentFilterError(SECRET),
    });

    const text = await respond(streamResult(parts.stream)).text();

    expect(text).toBe(`Partial reply. ${CONTENT_FILTER_NOTICE}`);
  });

  it("propagates an unrelated stream error instead of masking it as a notice", async () => {
    const parts = source([delta("Partial. ")], {
      error: new Error("upstream network error"),
    });

    await expect(respond(streamResult(parts.stream)).text()).rejects.toThrow(
      /upstream network error/,
    );
  });

  it("fails the response on an unrelated error part after partial output, even when finishReason resolves", async () => {
    const parts = source([
      delta("Partial answer. "),
      errorPart(new Error("upstream provider error")),
    ]);
    const stream = streamResult(parts.stream, async () => "error");

    await expect(respond(stream).text()).rejects.toThrow(
      /upstream provider error/,
    );
    expect(stream.counts.finishReason).toBe(0);
  });

  it("reads the source only as fast as a slow client consumes", async () => {
    const parts = source(
      Array.from({ length: 50 }, (_, i) => delta(`chunk-${i} `)),
    );
    const reader = respond(streamResult(parts.stream)).body!.getReader();

    await reader.read();
    await reader.read();
    await nextMacrotask();

    expect(parts.state.reads).toBeLessThanOrEqual(3);
  });

  it("on cancel during a pending read of a stalled source: releases the read, cancels the source, aborts the provider and stops", async () => {
    const parts = source([delta("First words")], "stall");
    const stream = streamResult(parts.stream, async () => "content-filter");
    const abortController = new AbortController();
    const reader = respond(stream, abortController).body!.getReader();
    await reader.read();
    const pendingRead = reader.read();
    await nextMacrotask();

    await reader.cancel("client went away");

    await expect(pendingRead).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(parts.state.cancelReason).toBe("client went away");
    expect(abortController.signal.aborted).toBe(true);
    expect(abortController.signal.reason).toBe("client went away");
    await nextMacrotask();
    expect(stream.counts.finishReason).toBe(0);
  });
});
