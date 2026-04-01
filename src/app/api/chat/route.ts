import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { loadAIConfig } from "@/lib/config-loader";

/**
 * POST /api/chat — streaming chat completions via Vercel AI SDK.
 *
 * Accepts: { messages, agentId? }
 * - messages: standard chat message array from useChat()
 * - agentId: optional, selects which agent config to use (default: aiConfig.defaultAgentId)
 *
 * The route resolves the agent config, applies the system prompt and model,
 * and streams the response back using the AI SDK's streaming protocol.
 *
 * Environment: requires OPENAI_API_KEY (or ANTHROPIC_API_KEY for anthropic agents).
 */
export async function POST(req: Request) {
  const aiConfig = loadAIConfig();
  const { messages, agentId } = await req.json();

  const agent = aiConfig.agents.find((a) => a.id === (agentId ?? aiConfig.defaultAgentId))
    ?? aiConfig.agents[0];

  const result = streamText({
    model: openai(agent.model),
    system: agent.systemPrompt,
    messages,
    ...(agent.maxTokens ? { maxOutputTokens: agent.maxTokens } : {}),
  });

  return result.toTextStreamResponse();
}
