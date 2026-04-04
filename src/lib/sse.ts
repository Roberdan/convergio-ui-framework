/**
 * SSE client helpers for the Convergio daemon event stream.
 *
 * The daemon emits domain events at GET /api/events/stream.
 * Use with the useEventSource hook for React components.
 */

const BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8420')
    : (process.env.API_URL ?? 'http://localhost:8420');

/** Build the SSE stream URL with optional filters. */
export function buildStreamUrl(filters?: {
  agent_filter?: string;
  org_id?: string;
  event_type?: string;
}): string {
  const params = new URLSearchParams();
  if (filters?.agent_filter) params.set('agent_filter', filters.agent_filter);
  if (filters?.org_id) params.set('org_id', filters.org_id);
  if (filters?.event_type) params.set('event_type', filters.event_type);
  const qs = params.toString();
  return `${BASE}/api/events/stream${qs ? `?${qs}` : ''}`;
}
