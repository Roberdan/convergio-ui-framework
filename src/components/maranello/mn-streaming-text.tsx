"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ── Markdown-lite parser ─────────────────────────────── */

const SEGMENT_RE = /(\*\*(.+?)\*\*|`([^`]+)`|\[(\d+)\])/g

/**
 * Parse raw text into React nodes, converting **bold**, `code`,
 * and [N] citation references into styled elements.
 */
function parseSegments(
  raw: string,
  onCite?: (index: number) => void,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let last = 0
  let k = 0
  const re = new RegExp(SEGMENT_RE.source, "g")

  for (let m = re.exec(raw); m !== null; m = re.exec(raw)) {
    if (m.index > last) {
      nodes.push(<span key={k++}>{raw.slice(last, m.index)}</span>)
    }
    if (m[2] !== undefined) {
      nodes.push(
        <strong key={k++} className="font-semibold">
          {m[2]}
        </strong>,
      )
    } else if (m[3] !== undefined) {
      nodes.push(
        <code
          key={k++}
          className="rounded bg-[var(--mn-surface-sunken)] px-1 py-0.5 text-xs font-mono"
        >
          {m[3]}
        </code>,
      )
    } else if (m[4] !== undefined) {
      const idx = parseInt(m[4], 10)
      nodes.push(
        <button
          key={k++}
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded px-1 text-xs",
            "font-medium text-[var(--mn-accent)] hover:underline",
            "focus-visible:outline-2 focus-visible:outline-offset-1",
            "focus-visible:outline-[var(--mn-accent)]",
          )}
          onClick={() => onCite?.(idx)}
          aria-label={`Citation ${idx}`}
        >
          [{idx}]
        </button>,
      )
    }
    last = m.index + m[0].length
  }

  if (last < raw.length) {
    nodes.push(<span key={k++}>{raw.slice(last)}</span>)
  }

  return nodes
}

/* ── CVA variants ─────────────────────────────────────── */

const streamingTextVariants = cva("text-sm leading-relaxed", {
  variants: {
    variant: {
      default: "text-[var(--mn-text)]",
      muted: "text-[var(--mn-text-muted)]",
    },
  },
  defaultVariants: { variant: "default" },
})

/* ── Props ────────────────────────────────────────────── */

export interface MnStreamingTextProps
  extends VariantProps<typeof streamingTextVariants> {
  /** Full or accumulated text to render. */
  text: string
  /** Whether more chunks are expected. Controls cursor and done callback. */
  streaming?: boolean
  /** Show a blinking cursor while streaming. @default true */
  typingCursor?: boolean
  /** Parse bold, inline code, and citation refs. @default true */
  processMarkdown?: boolean
  /** Typewriter speed in ms per character. Omit for instant rendering. */
  speed?: number
  /** Fires when streaming transitions from true to false. */
  onDone?: () => void
  /** Fires when a [N] citation button is clicked. */
  onCitationClick?: (index: number) => void
  className?: string
}

/* ── Component ────────────────────────────────────────── */

/**
 * Progressive text renderer with markdown-lite parsing.
 *
 * Displays text that streams in chunk-by-chunk (controlled by the parent
 * updating `text`) or character-by-character (when `speed` is set).
 * Supports bold, inline code, and citation references with ARIA live
 * regions for screen-reader accessibility.
 */
export function MnStreamingText({
  text,
  streaming = false,
  typingCursor = true,
  processMarkdown = true,
  speed,
  onDone,
  onCitationClick,
  variant,
  className,
}: MnStreamingTextProps) {
  const prevTextLen = useRef(text.length)
  const prevStreamingRef = useRef(streaming)
  const prevAnnouncedRef = useRef("")
  const [srAnnouncement, setSrAnnouncement] = useState("")

  const initialLen = speed != null ? 0 : text.length
  const [displayLen, setDisplayLen] = useState(initialLen)

  /* Typewriter: step through characters when speed is set */
  useEffect(() => {
    if (speed == null) return
    if (displayLen >= text.length) return

    const timer = setTimeout(() => {
      setDisplayLen((prev) => Math.min(prev + 1, text.length))
    }, speed)
    return () => clearTimeout(timer)
  }, [text.length, speed, displayLen])

  /* Sync displayLen when text changes without speed or resets */
  useEffect(() => {
    const prev = prevTextLen.current
    prevTextLen.current = text.length
    if (speed == null && text.length !== prev) {
      requestAnimationFrame(() => setDisplayLen(text.length))
    } else if (speed != null && text.length === 0 && prev > 0) {
      requestAnimationFrame(() => setDisplayLen(0))
    }
  }, [text.length, speed])

  /* Done callback: streaming true → false */
  useEffect(() => {
    if (prevStreamingRef.current && !streaming) {
      onDone?.()
    }
    prevStreamingRef.current = streaming
  }, [streaming, onDone])

  /* Derived state */
  const visibleText = speed != null ? text.slice(0, displayLen) : text
  const isAnimating = speed != null && displayLen < text.length
  const showCursor = (streaming || isAnimating) && typingCursor

  const content = processMarkdown
    ? parseSegments(visibleText, onCitationClick)
    : visibleText

  /* SR announcement: only announce newly-visible text */
  useEffect(() => {
    if (
      (streaming || isAnimating) &&
      visibleText.length > prevAnnouncedRef.current.length
    ) {
      setSrAnnouncement(visibleText.slice(prevAnnouncedRef.current.length))
    } else if (!streaming && !isAnimating) {
      setSrAnnouncement("")
    }
    prevAnnouncedRef.current = visibleText
  }, [visibleText, streaming, isAnimating])

  return (
    <div
      className={cn(
        streamingTextVariants({ variant }),
        !streaming && !isAnimating && "mn-stream--done",
        className,
      )}
      role="log"
      aria-live="polite"
      aria-atomic={false}
      aria-label="Streaming response"
    >
      <span>
        {content}
        {showCursor && (
          <span
            className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-text-bottom"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="sr-only" aria-live="polite">
        {srAnnouncement}
      </span>
    </div>
  )
}

export { streamingTextVariants }
