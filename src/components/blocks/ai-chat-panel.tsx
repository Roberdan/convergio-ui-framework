"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Send, Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import type { AIConfig } from "@/types";
import { cn } from "@/lib/utils";

/**
 * AI Chat Panel — streaming chat interface powered by Vercel AI SDK v6.
 *
 * Features: streaming indicator, error display with message,
 * agent/conversation reset, agent selector tabs.
 */
export function AIChatPanel({ defaultAgentId, aiConfig }: { defaultAgentId?: string; aiConfig: AIConfig }) {
  const [agentId, setAgentId] = useState(defaultAgentId ?? aiConfig.defaultAgentId);
  const agent = aiConfig.agents.find((a) => a.id === agentId) ?? aiConfig.agents[0];
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: agent.apiRoute ?? "/api/chat",
      body: { agentId },
    }),
  });

  const isStreaming = status === "streaming";
  const isLoading = isStreaming || status === "submitted";

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    sendMessage({ text });
  }

  function handleReset() {
    setMessages([]);
    setInputValue("");
  }

  function handleAgentSwitch(id: string) {
    setAgentId(id);
    setMessages([]);
    setInputValue("");
  }

  return (
    <div className="flex flex-col rounded-lg border bg-card text-card-foreground overflow-hidden">
      {/* Agent selector + reset */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        {aiConfig.agents.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => handleAgentSwitch(a.id)}
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
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset conversation"
            className="ml-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && !error && (
          <p className="text-center text-muted-foreground text-sm py-8">
            Ask {agent.name} anything.
          </p>
        )}
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} agentName={agent.name} />
        ))}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-8">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{agent.name} is typing...</span>
          </div>
        )}

        {/* Error display */}
        {error && <ChatError message={error.message} />}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Message ${agent.name}...`}
          aria-label={`Message ${agent.name}`}
          className="flex-1 h-9 rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button type="button" size="sm" disabled={isLoading || !inputValue.trim()} onClick={handleSend}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

/* ── Extracted sub-components to keep main under 250 lines ── */

interface ChatMessage {
  id: string;
  role: string;
  parts?: { type: string; text?: string }[];
}

function ChatBubble({ message: m, agentName }: { message: ChatMessage; agentName: string }) {
  return (
    <div
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        m.role === "user" ? "bg-muted ml-8" : "bg-secondary mr-8",
      )}
    >
      <p className="text-label mb-1">{m.role === "user" ? "You" : agentName}</p>
      <p className="whitespace-pre-wrap">
        {m.parts
          ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("") ?? ""}
      </p>
    </div>
  );
}

function ChatError({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm" role="alert">
      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-destructive font-medium">Failed to get response</p>
        <p className="text-muted-foreground text-xs mt-0.5">
          {message || "An unexpected error occurred."}
        </p>
      </div>
    </div>
  );
}
