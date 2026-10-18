import { describe, it, expect, beforeEach } from "vitest";
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
 * content-filter notice, error propagation, backpressure, cancellation and
 * the release of the provider call on every terminal path (issue #99).
 * The real SDK path is covered by route.content-filter.integration.test.ts.
 */

type Part = TextStreamPart<ToolSet>;

const delta = (text: string): Part => ({ type: "text-delta", id: "t1", text });
const errorPart = (error: unknown): Part => ({ type: "error", error });
const decode = (chunk?: Uint8Array) => new TextDecoder().decode(chunk);
const SECRET = "RAW_PROVIDER_MESSAGE_must_not_reach_the_client";
const noOutput = () => Promise.reject(new Error("No output generated."));
const nextMacrotask = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Provider-side source with highWaterMark 0, so `reads` counts exactly the
 * parts the adapter asked for. After the parts it closes, errors, or stalls
 * forever like a hung provider. Like an SDK tee branch, its cancellation
 * never settles, so any terminal path that awaited it would hang.
 */
function source(
  parts: Part[],
  end: "close" | "stall" | { error: unknown } = "close",
) {
  const state = { reads: 0, cancelled: false, cancelReason: undefined as unknown };
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
        state.cancelled = true;
        state.cancelReason = reason;
        return new Promise<void>(() => {});
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

/** The controller whose signal the route passes to `streamText`. */
let provider: AbortController;

beforeEach(() => {
  provider = new AbortController();
});

function respond({ result }: ReturnType<typeof streamResult>): Response {
  return toTextStreamResponseWithContentFilterNotice(result, provider);
}

describe("toTextStreamResponseWithContentFilterNotice", () => {
  it("uses a plain English notice with a Warning: prefix and no emoji", () => {
    expect(CONTENT_FILTER_NOTICE).toBe(`\n\n${CONTENT_FILTER_NOTICE_TEXT}`);
    expect(CONTENT_FILTER_NOTICE).not.toMatch(PICTOGRAPHIC);
  });

  it("streams text deltas unchanged as text/plain, closes on a normal finish and releases the provider call", async () => {
    const res = respond(
      streamResult(source([delta("Hello "), delta("world")]).stream),
    );

    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toBe("Hello world");
    expect(provider.signal.aborted).toBe(true);
  });

  it("appends the notice when finishReason is content-filter and releases the provider call", async () => {
    const res = respond(
      streamResult(
        source([delta("Partial answer.")]).stream,
        async () => "content-filter",
      ),
    );

    expect(await res.text()).toBe(`Partial answer.${CONTENT_FILTER_NOTICE}`);
    expect(provider.signal.aborted).toBe(true);
  });

  it("ends with the notice at a content_filter error part: no leak, nothing read after it, finishReason untouched, provider released", async () => {
    const parts = source([
      { type: "start" },
      errorPart(contentFilterError(SECRET)),
      delta("text after the rejection"),
    ]);
    const stream = streamResult(parts.stream, noOutput);

    const text = await respond(stream).text();

    expect(text).toBe(CONTENT_FILTER_NOTICE);
    expect(parts.state.reads).toBe(2);
    expect(stream.counts.finishReason).toBe(0);
    expect(provider.signal.aborted).toBe(true);
    expect(parts.state.cancelled).toBe(true);
  });

  it("appends the notice when the stream errors mid-stream with a content_filter APICallError and releases the provider call", async () => {
    const parts = source([delta("Partial reply. ")], {
      error: contentFilterError(SECRET),
    });

    const text = await respond(streamResult(parts.stream)).text();

    expect(text).toBe(`Partial reply. ${CONTENT_FILTER_NOTICE}`);
    expect(provider.signal.aborted).toBe(true);
  });

  it("propagates an unrelated stream error instead of masking it, and aborts the provider call with it", async () => {
    const failure = new Error("upstream network error");
    const parts = source([delta("Partial. ")], { error: failure });

    await expect(respond(streamResult(parts.stream)).text()).rejects.toThrow(
      /upstream network error/,
    );
    expect(provider.signal.reason).toBe(failure);
  });

  it("on an unrelated error part while the provider keeps streaming: errors at once, aborts the provider, cancels the reader without awaiting it, and stops reading", async () => {
    const failure = new Error("upstream provider error");
    const parts = source([
      delta("Partial answer. "),
      errorPart(failure),
      delta("late delta 1"),
      delta("late delta 2"),
    ]);
    const stream = streamResult(parts.stream, async () => "error");
    const reader = respond(stream).body!.getReader();

    expect(decode((await reader.read()).value)).toBe("Partial answer. ");
    await expect(reader.read()).rejects.toBe(failure);
    await nextMacrotask();

    expect(provider.signal.reason).toBe(failure);
    expect(parts.state.cancelReason).toBe(failure);
    expect(parts.state.reads).toBe(2);
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

  it("on cancel during a pending read of a stalled source: settles at once without awaiting the reader cancellation, aborts the provider and stops", async () => {
    const parts = source([delta("First words")], "stall");
    const stream = streamResult(parts.stream, async () => "content-filter");
    const reader = respond(stream).body!.getReader();
    await reader.read();
    const pendingRead = reader.read();
    await nextMacrotask();

    const outcome = await Promise.race([
      reader.cancel("client went away").then(() => "settled"),
      nextMacrotask().then(() => "still waiting"),
    ]);

    expect(outcome).toBe("settled");
    await expect(pendingRead).resolves.toEqual({ done: true, value: undefined });
    expect(parts.state.cancelReason).toBe("client went away");
    expect(provider.signal.reason).toBe("client went away");
    await nextMacrotask();
    expect(stream.counts.finishReason).toBe(0);
  });
});
