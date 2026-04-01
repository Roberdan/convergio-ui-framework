"use client"

import * as React from "react"
import { useCallback, useEffect, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Mic, Send, Copy, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────── */

export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp?: Date
  streaming?: boolean
}

export interface QuickAction { label: string; action: string }

/* ── CVA ───────────────────────────────────────────────── */

const bubbleVariants = cva(
  "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
  {
    variants: {
      role: {
        user: "ml-auto bg-[var(--mn-accent)] text-[var(--mn-text-inverse)]",
        assistant: "mr-auto bg-[var(--mn-surface-raised)] text-[var(--mn-text)] border border-[var(--mn-border)]",
      },
    },
    defaultVariants: { role: "assistant" },
  },
)

/* ── Helpers ───────────────────────────────────────────── */

const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

function renderContent(text: string) {
  const parts: React.ReactNode[] = []
  let key = 0
  const re = /```(\w*)\n?([\s\S]*?)```/g
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index! > last) parts.push(<InlineText key={key++} text={text.slice(last, m.index)} />)
    parts.push(<CodeBlock key={key++} lang={m[1]} code={m[2].trimEnd()} />)
    last = m.index! + m[0].length
  }
  if (last < text.length) parts.push(<InlineText key={key++} text={text.slice(last)} />)
  return parts
}

function InlineText({ text }: { text: string }) {
  const out: React.ReactNode[] = []
  let k = 0, last = 0
  for (const m of text.matchAll(/(\*\*(.+?)\*\*|`([^`]+)`)/g)) {
    if (m.index! > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>)
    if (m[2]) out.push(<strong key={k++}>{m[2]}</strong>)
    else if (m[3]) out.push(<code key={k++} className="rounded bg-[var(--mn-surface-sunken)] px-1 py-0.5 text-xs font-mono">{m[3]}</code>)
    last = m.index! + m[0].length
  }
  if (last < text.length) out.push(<span key={k++}>{text.slice(last)}</span>)
  return <>{out}</>
}

function CodeBlock({ lang, code }: { lang?: string; code: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }, [code])
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface-sunken)]">
      <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[var(--mn-text-muted)]">
        <span>{lang || "code"}</span>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-[var(--mn-hover-bg)]">
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2 text-xs leading-snug font-mono"><code>{code}</code></pre>
    </div>
  )
}

/* ── Message bubble ────────────────────────────────────── */

function MessageBubble({ message: m }: { message: ChatMessage }) {
  return (
    <div className={cn("flex flex-col gap-0.5", m.role === "user" ? "items-end" : "items-start")}>
      <div className={bubbleVariants({ role: m.role })}>
        {m.streaming ? m.content || "\u00A0" : renderContent(m.content)}
        {m.streaming && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-text-bottom" />}
      </div>
      {m.timestamp && <span className="px-1 text-[10px] text-[var(--mn-text-tertiary)]">{fmtTime(m.timestamp)}</span>}
    </div>
  )
}

/* ── Props ─────────────────────────────────────────────── */

export interface MnChatProps {
  messages: ChatMessage[]
  loading?: boolean
  quickActions?: QuickAction[]
  placeholder?: string
  onSend?: (text: string) => void
  onVoiceStart?: () => void
  onQuickAction?: (action: string) => void
  className?: string
}

/* ── Main component ────────────────────────────────────── */

export function MnChat({
  messages, loading = false, quickActions, placeholder = "Type a message\u2026",
  onSend, onVoiceStart, onQuickAction, className,
}: MnChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = React.useState("")

  useEffect(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }))
  }, [messages])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || !onSend) return
    onSend(text)
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }, [input, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)]", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        {loading && !messages.some((m) => m.streaming) && (
          <div className="flex items-center gap-2 text-sm text-[var(--mn-text-muted)]">
            <Loader2 className="size-4 animate-spin" /><span>Thinking&hellip;</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Quick actions */}
      {quickActions && quickActions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-t border-[var(--mn-border)] px-4 py-2">
          {quickActions.map((qa) => (
            <button key={qa.action} type="button" onClick={() => onQuickAction?.(qa.action)}
              className="shrink-0 rounded-full border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] px-3 py-1 text-xs text-[var(--mn-text)] hover:bg-[var(--mn-hover-bg)] transition-colors">
              {qa.label}
            </button>
          ))}
        </div>
      )}
      {/* Input area */}
      <div className="flex items-end gap-2 border-t border-[var(--mn-border)] px-3 py-2">
        {onVoiceStart && (
          <button type="button" onClick={onVoiceStart} aria-label="Voice input"
            className="shrink-0 rounded-lg p-2 text-[var(--mn-text-muted)] hover:bg-[var(--mn-hover-bg)] transition-colors">
            <Mic className="size-4" />
          </button>
        )}
        <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown}
          placeholder={placeholder} rows={1}
          className="flex-1 resize-none bg-transparent py-1.5 text-sm text-[var(--mn-text)] placeholder:text-[var(--mn-text-muted)] outline-none" />
        <button type="button" onClick={handleSend} disabled={!input.trim() || loading} aria-label="Send message"
          className={cn("shrink-0 rounded-lg p-2 transition-colors", input.trim() ? "bg-[var(--mn-accent)] text-[var(--mn-text-inverse)] hover:opacity-90" : "text-[var(--mn-text-tertiary)]")}>
          <Send className="size-4" />
        </button>
      </div>
    </div>
  )
}

export { bubbleVariants }
