/** format.ts — date & number formatting helpers. */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "Apr 24, 2024, 9:41 AM" — matches the mockups. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const h = d.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const min = d.getMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${hour12}:${min} ${ampm}`;
}

export function formatRelative(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso).getTime();
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
