"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import type { AIConfig } from "@/types";
import { cn } from "@/lib/utils";

/**
 * AI Chat Panel — streaming chat interface powered by Vercel AI SDK v6.
 *
 * Receives agent configuration from the server via props (sourced from convergio.yaml).
 * Connects to /api/chat (or custom route) via DefaultChatTransport.
 *
 * @example
 * ```tsx
 * <AIChatPanel aiConfig={aiConfig} />
 * <AIChatPanel aiConfig={aiConfig} defaultAgentId="nasra" />
 * ```
 */
export function AIChatPanel({ defaultAgentId, aiConfig }: { defaultAgentId?: string; aiConfig: AIConfig }) {
  const [agentId, setAgentId] = useState(defaultAgentId ?? aiConfig.defaultAgentId);
  const agent = aiConfig.agents.find((a) => a.id === agentId) ?? aiConfig.agents[0];
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: agent.apiRoute ?? "/api/chat",
      body: { agentId },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col rounded-lg border bg-card text-card-foreground overflow-hidden">
      {/* Agent selector */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        {aiConfig.agents.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAgentId(a.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              a.id === agentId
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {a.name}
          </button>
        ))}
        <span className="ml-auto text-micro hidden sm:inline">{agent.description}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            Ask {agent.name} anything.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-md px-3 py-2 text-sm",
              m.role === "user" ? "bg-muted ml-8" : "bg-secondary mr-8",
            )}
          >
            <p className="text-label mb-1">{m.role === "user" ? "You" : agent.name}</p>
            <p className="whitespace-pre-wrap">
              {m.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("") ?? ""}
            </p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Message ${agent.name}...`}
          className="flex-1 h-9 rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button type="button" size="sm" disabled={isLoading || !inputValue.trim()} onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
