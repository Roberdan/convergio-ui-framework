"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "@/lib/api";

interface UseApiQueryResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Client-side data fetching hook with optional polling.
 * For server components, call API functions directly.
 */
export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  options?: { pollInterval?: number; enabled?: boolean },
): UseApiQueryResult<T> {
  const { pollInterval, enabled = true } = options ?? {};
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `API Error ${err.status}: ${err.body.slice(0, 100)}`
          : err instanceof Error
            ? err.message
            : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    if (!pollInterval || !enabled) return;
    const id = setInterval(execute, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, enabled, execute]);

  return { data, error, loading, refetch: execute };
}
