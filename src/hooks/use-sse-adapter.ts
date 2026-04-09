"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useEventSource } from "./use-event-source"

export type SSEStatus = "connecting" | "open" | "error" | "closed"

export interface SSEEvent {
  type: string
  data: unknown
  id?: string
  timestamp?: number
}

export interface UseSSEAdapterConfig<T> {
  /** SSE endpoint URL. Pass `null` to disconnect. */
  url: string | null
  /** Starting state before any event arrives. */
  initialData: T
  /** Reducer: receives each SSE event + current accumulated state, returns next state. */
  mapEvent: (event: SSEEvent, current: T) => T
  /** When false the connection is not opened. @default true */
  enabled?: boolean
}

export interface UseSSEAdapterResult<T> {
  data: T
  status: SSEStatus
  lastEvent: SSEEvent | null
}

function deriveStatus(connected: boolean, error: string | null, url: string | null): SSEStatus {
  if (!url) return "closed"
  if (error) return "error"
  if (connected) return "open"
  return "connecting"
}

/**
 * Generic SSE adapter that wraps `useEventSource`.
 *
 * Each incoming message is transformed through `mapEvent` and the result is
 * accumulated in `data`, starting from `initialData`.
 */
export function useSSEAdapter<T>(config: UseSSEAdapterConfig<T>): UseSSEAdapterResult<T> {
  const { url, initialData, mapEvent, enabled = true } = config

  const [data, setData] = useState<T>(initialData)
  const lastEventRef = useRef<SSEEvent | null>(null)
  const [lastEventState, setLastEventState] = useState<SSEEvent | null>(null)

  const mapEventRef = useRef(mapEvent)
  useEffect(() => { mapEventRef.current = mapEvent })

  const handleMessage = useCallback((raw: unknown) => {
    const event: SSEEvent = {
      type: typeof raw === "object" && raw !== null && "type" in raw
        ? String((raw as Record<string, unknown>).type)
        : "message",
      data: raw,
      id: typeof raw === "object" && raw !== null && "id" in raw
        ? String((raw as Record<string, unknown>).id)
        : undefined,
      timestamp: Date.now(),
    }

    lastEventRef.current = event
    setLastEventState(event)
    setData((current) => mapEventRef.current(event, current))
  }, [])

  const { connected, error } = useEventSource<unknown>(url, {
    enabled,
    onMessage: handleMessage,
  })

  const status = deriveStatus(connected, error, url)

  return { data, status, lastEvent: lastEventState }
}
