/**
 * Hydration-safe date/time formatting utilities.
 *
 * Uses fixed 'en-GB' locale to prevent server/client mismatch
 * from differing default locales (Node vs browser).
 */

const LOCALE = 'en-GB' as const;

/** Format timestamp as "1 Apr 2025, 14:30" */
export function formatDateTime(ts: string): string {
  try {
    return new Date(ts).toLocaleString(LOCALE, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return ts;
  }
}

/** Format timestamp as "14:30" */
export function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString(LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return ts;
  }
}

/** Format number with thousands separator */
export function formatNumber(n: number): string {
  return n.toLocaleString(LOCALE);
}
