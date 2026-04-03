"use client";

import { useState, useEffect, useRef } from "react";

interface UseEventSourceOptions {
  enabled?: boolean;
  onMessage?: (data: unknown) => void;
}

interface UseEventSourceResult<T> {
  data: T | null;
  connected: boolean;
  error: string | null;
}

/**
 * SSE (Server-Sent Events) hook for real-time data streaming.
 * Reconnects with exponential backoff on disconnect.
 */
export function useEventSource<T>(
  url: string | null,
  options?: UseEventSourceOptions,
): UseEventSourceResult<T> {
  const { enabled = true, onMessage } = options ?? {};
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onMessageRef = useRef(onMessage);
  const retryRef = useRef(1000);
  const connectRef = useRef<(() => (() => void) | undefined) | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    connectRef.current = () => {
      if (!url || !enabled) return undefined;

      const source = new EventSource(url);

      source.onopen = () => {
        setConnected(true);
        setError(null);
        retryRef.current = 1000;
      };

      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as T;
          setData(parsed);
          onMessageRef.current?.(parsed);
        } catch {
          setData(event.data as T);
        }
      };

      source.onerror = () => {
        source.close();
        setConnected(false);
        setError("Connection lost");
        const delay = Math.min(retryRef.current, 30000);
        retryRef.current = delay * 2;
        setTimeout(() => connectRef.current?.(), delay);
      };

      return () => source.close();
    };

    const cleanup = connectRef.current();
    return cleanup;
  }, [url, enabled]);

  return { data, connected, error };
}
