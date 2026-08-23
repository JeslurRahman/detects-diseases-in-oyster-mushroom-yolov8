/** format.ts — date & number formatting helpers (Sri Lanka time). */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Sri Lanka is a fixed UTC+05:30 offset (no daylight saving).
const SL_OFFSET_MIN = 5 * 60 + 30;

/**
 * Parse a backend timestamp as UTC. The API stores UTC but serializes without a
 * timezone suffix (e.g. "2026-07-19T16:08:56"), which `new Date()` would wrongly
 * treat as local time — so we append 'Z' when no offset is present.
 */
function parseUtc(iso: string): Date {
  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasTz ? iso : `${iso}Z`);
}

/** Shift a UTC date to Sri Lanka wall-clock; read it via getUTC* accessors. */
function toColombo(iso: string): Date | null {
  const utc = parseUtc(iso);
  if (Number.isNaN(utc.getTime())) return null;
  return new Date(utc.getTime() + SL_OFFSET_MIN * 60_000);
}

/** "Apr 24, 2024, 9:41 AM" in Sri Lanka time. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return '-';
  const d = toColombo(iso);
  if (!d) return '-';
  const h = d.getUTCHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const min = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}, ${hour12}:${min} ${ampm}`;
}

export function formatRelative(iso?: string | null): string {
  if (!iso) return '';
  const d = parseUtc(iso).getTime();
  if (Number.isNaN(d)) return '';
  const diff = Date.now() - d;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatDateTime(iso);
}

export function formatConfidence(value: number): string {
  const pct = value <= 1 ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}
