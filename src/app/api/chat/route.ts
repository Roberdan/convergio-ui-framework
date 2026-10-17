import { cookies } from "next/headers";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { streamText, APICallError } from "ai";
import { z } from "zod";
import { consumeToken } from "@/lib/rate-limit";
import { verifyValue } from "@/lib/session";
import type { AgentConfig } from "@/types/ai";

/**
 * POST /api/chat — streaming chat completions via Vercel AI SDK.
 *
 * Requires authenticated session cookie.
 * Accepts: { messages, agentId? }
 * Input is validated with Zod before processing.
 *
 * Provider routing is config-driven via convergio.yaml:
 * "openai", "anthropic", "copilot", "qwen", "azure"
 */

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
  agentId: z.string().optional(),
});

function resolveModel(agent: AgentConfig) {
  switch (agent.provider) {
    case "openai":
      return openai(agent.model);
    case "azure": {
      const azure = createOpenAI({
        baseURL: process.env.AZURE_OPENAI_ENDPOINT
          ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments`
          : "",
        apiKey: process.env.AZURE_OPENAI_API_KEY ?? "",
        headers: { "api-key": process.env.AZURE_OPENAI_API_KEY ?? "" },
      });
      return azure(agent.model);
    }
    case "qwen": {
      const qwen = createOpenAI({
        baseURL:
          process.env.QWEN_BASE_URL ??
          "https://dashscope.aliyuncs.com/compatible-mode/v1",
        apiKey: process.env.QWEN_API_KEY ?? "",
      });
      return qwen(agent.model);
    }
    case "anthropic": {
      const anthropic = createOpenAI({
        baseURL:
          process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com/v1",
        apiKey: process.env.ANTHROPIC_API_KEY ?? "",
      });
      return anthropic(agent.model);
    }
    case "copilot": {
      const copilot = createOpenAI({
        baseURL:
          process.env.COPILOT_BASE_URL ?? "https://api.githubcopilot.com",
        apiKey: process.env.GITHUB_TOKEN ?? "",
      });
      return copilot(agent.model);
    }
    case "custom":
      throw new Error(
        `Provider "custom" not configured for agent "${agent.id}".`,
      );
    default: {
      const exhaustive: never = agent.provider;
      throw new Error(`Unknown provider "${exhaustive}".`);
    }
  }
}

/**
 * Azure (and Azure-fronted OpenAI-compatible) providers reject or truncate a
 * generation under `content_filter` in two shapes:
 * - an immediate 400 `APICallError` whose parsed body is `{ error: { code: "content_filter" } }`
 * - a 200 response that completes with `finishReason === "content-filter"`
 * Both must reach the client as a readable notice appended to the text stream,
 * instead of a silently truncated response or an opaque network error. Only
 * the enum-like `error.code` is ever read from the error body — never the
 * body text itself, which may echo the prompt back.
 */
const CONTENT_FILTER_NOTICE =
  "\n\n⚠️ This response was stopped by the content filter and could not be completed.";

function isContentFilterError(error: unknown): boolean {
  if (!APICallError.isInstance(error)) return false;
  const code = (error.data as { error?: { code?: unknown } } | undefined)?.error
    ?.code;
  return code === "content_filter";
}

/**
 * Wraps `streamText`'s text stream so a content-filter rejection — whether it
 * arrives as a thrown error mid-stream or as a `content-filter` finish reason
 * on an otherwise-200 response — surfaces as an appended notice instead of a
 * silently truncated or dropped stream. Any other stream error is re-thrown
 * so it still fails loudly (visible in server logs / Next.js error overlay)
 * rather than being swallowed.
 */
function toTextStreamResponseWithContentFilterNotice(
  result: ReturnType<typeof streamText>,
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        if ((await result.finishReason) === "content-filter") {
          controller.enqueue(encoder.encode(CONTENT_FILTER_NOTICE));
        }
      } catch (err) {
        if (isContentFilterError(err)) {
          controller.enqueue(encoder.encode(CONTENT_FILTER_NOTICE));
        } else {
          controller.error(err);
          return;
        }
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  /* Auth gate: verify signed session cookie */
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }
  const sessionValue = await verifyValue(sessionCookie.value);
  if (!sessionValue) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid session" } },
      { status: 401 },
    );
  }

  // Rate limit: 60 chat requests / minute steady state, per session.
  const rate = consumeToken(sessionValue);
  if (!rate.allowed) {
    return Response.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Chat request rate limit exceeded — slow down.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSec),
          "X-RateLimit-Limit": String(rate.limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON",
        },
      },
      { status: 400 },
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details,
        },
      },
      { status: 422 },
    );
  }

  const { messages, agentId } = parsed.data;
  const { loadAIConfig } = await import("@/lib/config-loader");
  const aiConfig = loadAIConfig();

  const agent =
    aiConfig.agents.find(
      (a) => a.id === (agentId ?? aiConfig.defaultAgentId),
    ) ?? aiConfig.agents[0];

  if (!agent) {
    return Response.json(
      { error: { code: "NO_AGENT", message: "No AI agents configured" } },
      { status: 503 },
    );
  }

  let model;
  try {
    model = resolveModel(agent);
  } catch (err) {
    return Response.json(
      { error: { code: "PROVIDER_ERROR", message: (err as Error).message } },
      { status: 501 },
    );
  }

  const result = streamText({
    model,
    system: agent.systemPrompt,
    messages,
    ...(agent.maxTokens ? { maxOutputTokens: agent.maxTokens } : {}),
  });

  const response = toTextStreamResponseWithContentFilterNotice(result);
  response.headers.set("X-RateLimit-Limit", String(rate.limit));
  response.headers.set("X-RateLimit-Remaining", String(rate.remaining));
  return response;
}
