'use client';

/**
 * SSE hook for daemon event stream.
 * Combines useEventSource with the stream URL builder.
 */

import { useEventSource } from './use-event-source';
import { buildStreamUrl } from '@/lib/sse';
import type { IpcEvent } from '@/lib/types';

interface UseSseOptions {
  agent_filter?: string;
  org_id?: string;
  event_type?: string;
  enabled?: boolean;
  onMessage?: (event: IpcEvent) => void;
}

export function useSse(options?: UseSseOptions) {
  const { agent_filter, org_id, event_type, enabled = true, onMessage } =
    options ?? {};

  const url = enabled
    ? buildStreamUrl({ agent_filter, org_id, event_type })
    : null;

  return useEventSource<IpcEvent>(url, {
    enabled,
    onMessage: onMessage as ((data: unknown) => void) | undefined,
  });
}
