import { loadAIConfig } from "@/lib/config-loader";
import { AIChatPanel } from "./ai-chat-panel";
import type { AIChatBlock } from "@/types";

/**
 * Wrapper that adapts AIChatBlock config to AIChatPanel props.
 * Loads AI config at render time so PageRenderer stays config-agnostic.
 */
export function AIChatBlockWrapper(props: AIChatBlock) {
  return <AIChatPanel defaultAgentId={props.agentId} aiConfig={loadAIConfig()} />;
}
