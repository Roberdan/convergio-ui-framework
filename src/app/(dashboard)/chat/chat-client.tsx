"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { chatApi } from "@/lib/api";
import { useApiQuery } from "@/hooks";
import { MnChat, MnBadge, MnSpinner } from "@/components/maranello";
import type { ChatMessage } from "@/components/maranello";

export function ChatClient() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const nextId = useRef(1);

  const { data: providers } = useApiQuery(
    () => chatApi.getInferenceProviders(),
    { pollInterval: 60000 },
  );

  const initSession = useCallback(async () => {
    try {
      const session = await chatApi.createChatSession();
      setSessionId(session.sessionId);
      return session.sessionId;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleSend = useCallback(
    async (text: string) => {
      let sid = sessionId;
      if (!sid) {
        sid = await initSession();
        if (!sid) return;
      }

      const userMsg: ChatMessage = {
        id: String(nextId.current++),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const streamUrl = chatApi.getChatStreamUrl(sid);
        const assistantId = String(nextId.current++);

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "", streaming: true },
        ]);

        const response = await fetch(streamUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, sessionId: sid }),
        });

        if (!response.body) {
          const fallback = await chatApi.sendChatMessage({
            sessionId: sid,
            message: text,
          });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: fallback.content, streaming: false }
                : m,
            ),
          );
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m,
          ),
        );
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => !m.streaming),
          {
            id: String(nextId.current++),
            role: "assistant",
            content: "Connection error. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, initSession],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>AI Chat</h1>
          <p className="text-caption mt-1">Interact with platform AI agents</p>
        </div>
        <div className="flex items-center gap-2">
          {providers?.map((p) => (
            <MnBadge
              key={p.id}
              label={p.name}
              tone={
                p.status === "available"
                  ? "success"
                  : p.status === "degraded"
                    ? "warning"
                    : "danger"
              }
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card h-[calc(100vh-16rem)]">
        {!sessionId ? (
          <div className="flex items-center justify-center h-full">
            <MnSpinner size="lg" label="Initializing session..." />
          </div>
        ) : (
          <MnChat
            messages={messages}
            loading={loading}
            onSend={handleSend}
            placeholder="Ask anything about the platform..."
            quickActions={[
              { label: "Show system status", action: "show system status" },
              { label: "List active plans", action: "list active plans" },
              { label: "Agent summary", action: "agent summary" },
            ]}
            onQuickAction={handleSend}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}
