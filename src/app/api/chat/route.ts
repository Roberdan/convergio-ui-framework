import { cookies } from "next/headers";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { loadAIConfig } from "@/lib/config-loader";
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
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1),
  })).min(1),
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
        baseURL: process.env.QWEN_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
        apiKey: process.env.QWEN_API_KEY ?? "",
      });
      return qwen(agent.model);
    }
    case "anthropic": {
      const anthropic = createOpenAI({
        baseURL: process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com/v1",
        apiKey: process.env.ANTHROPIC_API_KEY ?? "",
      });
      return anthropic(agent.model);
    }
    case "copilot": {
      const copilot = createOpenAI({
        baseURL: process.env.COPILOT_BASE_URL ?? "https://api.githubcopilot.com",
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } },
      { status: 400 },
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid request", details } },
      { status: 422 },
    );
  }

  const { messages, agentId } = parsed.data;
  const aiConfig = loadAIConfig();

  const agent =
    aiConfig.agents.find((a) => a.id === (agentId ?? aiConfig.defaultAgentId)) ??
    aiConfig.agents[0];

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

  const response = result.toTextStreamResponse();
  response.headers.set("X-RateLimit-Limit", "60");
  response.headers.set("X-RateLimit-Remaining", "59");
  return response;
}
