"use client";

/**
 * A2UI SSE client + REST hydration.
 *
 * Connects to the daemon's /api/a2ui/stream via EventSource for real-time
 * block updates. On mount, hydrates from GET /api/a2ui/blocks. Includes
 * exponential backoff reconnection (1s -> 2s -> 4s -> ... -> 30s cap).
 */

import { useEffect, useRef } from "react";
import {
  useA2UIDispatch,
  addBlock,
  dismissBlock,
  replaceBlock,
  setBlocks,
} from "./store";
import type { A2UIBlock, A2UIBlocksResponse } from "./types";

const DAEMON_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8420";
const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;
const BACKOFF_FACTOR = 2;

/**
 * Fetches existing active blocks from the daemon REST endpoint.
 * Returns empty array on failure to avoid breaking the UI.
 */
async function hydrateBlocks(): Promise<A2UIBlock[]> {
  try {
    const res = await fetch(`${DAEMON_URL}/api/a2ui/blocks`);
    if (!res.ok) {
      console.error(`[a2ui] hydration failed: ${res.status}`);
      return [];
    }
    const data: A2UIBlocksResponse = await res.json();
    return data.blocks ?? [];
  } catch (err) {
    console.error("[a2ui] hydration error:", err);
    return [];
  }
}

/**
 * Hook that connects the A2UI SSE stream and hydrates from REST.
 *
 * Call once at the app shell level. Manages its own lifecycle:
 * opens EventSource on mount, closes on unmount, reconnects on error.
 */
export function useA2UIClient() {
  const dispatch = useA2UIDispatch();
  const retryMs = useRef(INITIAL_RETRY_MS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let es: EventSource | null = null;

    /* REST hydration on mount */
    hydrateBlocks().then((blocks) => {
      if (!cancelled) setBlocks(dispatch, blocks);
    });

    function connect() {
      if (cancelled) return;
      es = new EventSource(`${DAEMON_URL}/api/a2ui/stream`);

      es.addEventListener("block_pushed", (ev) => {
        const block: A2UIBlock = JSON.parse(ev.data);
        addBlock(dispatch, block);
      });

      es.addEventListener("block_dismissed", (ev) => {
        const block: A2UIBlock = JSON.parse(ev.data);
        dismissBlock(dispatch, block.block_id);
      });

      es.addEventListener("block_replaced", (ev) => {
        const block: A2UIBlock = JSON.parse(ev.data);
        replaceBlock(dispatch, block.block_id, block);
      });

      es.onopen = () => {
        retryMs.current = INITIAL_RETRY_MS;
      };

      es.onerror = () => {
        es?.close();
        if (cancelled) return;
        const delay = retryMs.current;
        retryMs.current = Math.min(delay * BACKOFF_FACTOR, MAX_RETRY_MS);
        console.warn(`[a2ui] SSE disconnected, retry in ${delay}ms`);
        timerRef.current = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      cancelled = true;
      es?.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dispatch]);
}
