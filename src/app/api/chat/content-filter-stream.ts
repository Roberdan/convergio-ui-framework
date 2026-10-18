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
 *
 * Every terminal path (normal end, content-filter notice, error, client
 * cancellation) goes through `end()`: nothing is read or written afterwards,
 * `abortController` is aborted and the source reader is cancelled without
 * waiting for that cancellation, because an SDK tee branch can settle late or
 * never. The abort is what stops the provider: `abortController` must be the
 * one whose signal was passed to `streamText`, since the SDK's stream views
 * are tee branches that a reader cancel alone never reaches.
 *
 * Content-filter outcomes end the response with the notice. Any other error,
 * whether the stream fails or the SDK reports an `error` part after partial
 * output, errors the response, so it fails loudly instead of being swallowed
 * or passed off as a complete answer.
 */
export function toTextStreamResponseWithContentFilterNotice(
  result: ChatStreamResult,
  abortController: AbortController,
): Response {
  const encoder = new TextEncoder();
  const reader = result.fullStream.getReader();
  let ended = false;

  function end(reason?: unknown): void {
    if (ended) return;
    ended = true;
    abortController.abort(reason);
    reader.cancel(reason).catch(() => {});
  }

  function close(
    controller: ReadableStreamDefaultController<Uint8Array>,
    withNotice: boolean,
  ): void {
    end();
    if (withNotice) controller.enqueue(encoder.encode(CONTENT_FILTER_NOTICE));
    controller.close();
  }

  const stream = new ReadableStream<Uint8Array>(
    {
      async pull(controller) {
        try {
          for (;;) {
            const { done, value: part } = await reader.read();
            if (ended) return;
            if (done) break;
            if (part.type === "text-delta") {
              controller.enqueue(encoder.encode(part.text));
              return;
            }
            if (part.type === "error") throw part.error;
          }
          const finishReason = await result.finishReason;
          if (!ended) close(controller, finishReason === "content-filter");
        } catch (err) {
          if (ended) return;
          if (isContentFilterError(err)) {
            close(controller, true);
            return;
          }
          end(err);
          controller.error(err);
        }
      },
      cancel(reason) {
        end(reason);
      },
    },
    { highWaterMark: 0 },
  );
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
