/**
 * AI Agent configuration.
 *
 * Defines an AI agent that can be used in the app's chat/command surfaces.
 * Each agent has a unique ID, display metadata, and connection config.
 *
 * The system supports multiple agents — configure them in src/config/ai.config.ts.
 * The active agent is selected by the user or by context (page, action).
 *
 * @example
 * ```ts
 * const jervis: AgentConfig = {
 *   id: "jervis",
 *   name: "Jervis",
 *   description: "Convergio platform orchestrator",
 *   provider: "openai",
 *   model: "gpt-4o",
 *   systemPrompt: "You are Jervis, the Convergio platform AI assistant.",
 *   apiRoute: "/api/chat",
 * };
 * ```
 */
export interface AgentConfig {
  /** Unique agent identifier (e.g. "jervis", "nasra", "copilot"). */
  id: string;
  /** Display name shown in the chat UI. */
  name: string;
  /** Short description of the agent's purpose. */
  description: string;
  /** LLM provider — SDK-based via Vercel AI SDK. */
  provider: "openai" | "anthropic" | "copilot" | "qwen" | "azure" | "custom";
  /** Model identifier (e.g. "gpt-4o", "claude-sonnet-4-6"). */
  model: string;
  /** System prompt that defines agent behavior. */
  systemPrompt: string;
  /** API route for chat completions. Default: "/api/chat". */
  apiRoute?: string;
  /** Optional avatar URL or initials for the chat UI. */
  avatar?: string;
  /** Optional max tokens per response. */
  maxTokens?: number;
}

/**
 * AI configuration — all available agents for this app.
 *
 * @example
 * ```ts
 * const aiConfig: AIConfig = {
 *   defaultAgentId: "jervis",
 *   agents: [jervis, nasra],
 * };
 * ```
 */
export interface AIConfig {
  /** ID of the agent to use by default. */
  defaultAgentId: string;
  /** All available agents. */
  agents: AgentConfig[];
}
