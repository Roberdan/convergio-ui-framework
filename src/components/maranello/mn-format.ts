/**
 * Hydration-safe date/time formatting utilities.
 *
 * Uses manual formatting to prevent server/client mismatch
 * from differing Intl implementations (Node vs Safari vs Chrome).
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Format timestamp as "1 Apr 2025, 14:30" */
export function formatDateTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  } catch {
    return ts;
  }
}

/** Format timestamp as "14:30" */
export function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  } catch {
    return ts;
  }
}

/** Format number with thousands separator (consistent across runtimes) */
export function formatNumber(n: number): string {
  const s = Math.abs(n).toString();
  const parts: string[] = [];
  for (let i = s.length; i > 0; i -= 3) {
    parts.unshift(s.slice(Math.max(0, i - 3), i));
  }
  return (n < 0 ? '-' : '') + parts.join(',');
}

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Format month label as "January 2025" */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS_LONG[month]} ${year}`;
}
