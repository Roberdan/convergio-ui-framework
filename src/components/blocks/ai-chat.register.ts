import { registerBlock } from "@/lib/block-registry";
import { AIChatBlockWrapper } from "./ai-chat-block-wrapper";

registerBlock("ai-chat", AIChatBlockWrapper);
