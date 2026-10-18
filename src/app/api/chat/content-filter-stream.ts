import {
  APICallError,
  type FinishReason,
  type TextStreamPart,
  type ToolSet,
} from "ai";

/**
 * Azure (and Azure-fronted OpenAI-compatible) providers reject or truncate a
 * generation under `content_filter` in three shapes:
 * - an immediate HTTP 400 `APICallError` whose parsed body is
 *   `{ error: { code: "content_filter" } }`, raised before any provider stream
 *   exists; `streamText` reports it only as an `error` part on `fullStream`
 *   (its `textStream` drops error parts);
 * - the same error raised while the provider stream is already running;
 * - a 200 response that completes with `finishReason === "content-filter"`.
 * All three reach the client as a readable notice appended to the text
 * stream. Only the enum-like `error.code` is ever read from the error body,
 * never the body text itself, which may echo the prompt back.
 */
export const CONTENT_FILTER_NOTICE =
  "\n\nWarning: This response was stopped by the content filter and could not be completed.";

function isContentFilterError(error: unknown): boolean {
  if (!APICallError.isInstance(error)) return false;
  const code = (error.data as { error?: { code?: unknown } } | undefined)?.error
    ?.code;
  return code === "content_filter";
}

/** The parts of a `streamText()` result the adapter reads. */
export type ChatStreamResult = {
  readonly fullStream: ReadableStream<TextStreamPart<ToolSet>>;
  readonly finishReason: PromiseLike<FinishReason>;
};

/**
 * Turns a `streamText()` result into a plain-text streaming Response.
 *
 * Pull-driven: the source is read only when the client reads (highWaterMark
 * 0), so a slow client never makes output pile up in the response queue.
 * Cancelling the response cancels a pending source read immediately and
 * aborts `abortController`, which must be the one whose signal was passed to
 * `streamText`: the SDK's stream views are tee branches, so only the signal
 * reaches the provider request. Nothing is read or written after that.
 *
 * Content-filter outcomes become an appended notice. Any other stream error
 * still errors the response, so it fails loudly instead of being swallowed.
 */
export function toTextStreamResponseWithContentFilterNotice(
  result: ChatStreamResult,
  abortController: AbortController,
): Response {
  const encoder = new TextEncoder();
  const reader = result.fullStream.getReader();
  let cancelled = false;
  let contentFiltered = false;

  async function finish(
    controller: ReadableStreamDefaultController<Uint8Array>,
  ): Promise<void> {
    if (!contentFiltered) {
      contentFiltered = (await result.finishReason) === "content-filter";
      if (cancelled) return;
    }
    if (contentFiltered) controller.enqueue(encoder.encode(CONTENT_FILTER_NOTICE));
    controller.close();
  }

  const stream = new ReadableStream<Uint8Array>(
    {
      async pull(controller) {
        try {
          for (;;) {
            const { done, value: part } = await reader.read();
            if (cancelled) return;
            if (done) return await finish(controller);
            if (part.type === "text-delta") {
              controller.enqueue(encoder.encode(part.text));
              return;
            }
            if (part.type === "error" && isContentFilterError(part.error)) {
              contentFiltered = true;
            }
          }
        } catch (err) {
          if (cancelled) return;
          if (!isContentFilterError(err)) {
            controller.error(err);
            return;
          }
          controller.enqueue(encoder.encode(CONTENT_FILTER_NOTICE));
          controller.close();
        }
      },
      cancel(reason) {
        cancelled = true;
        abortController.abort(reason);
        return reader.cancel(reason);
      },
    },
    { highWaterMark: 0 },
  );
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
