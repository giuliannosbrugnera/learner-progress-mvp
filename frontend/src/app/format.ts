const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "4 days ago", "yesterday", "3 hours ago". Timestamps are UTC ISO strings; display is local. */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diffSeconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 3600) return relativeTime.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return relativeTime.format(Math.round(diffSeconds / 3600), 'hour');
  return relativeTime.format(Math.round(diffSeconds / 86400), 'day');
}

/** 25 -> "25 min", 90 -> "1 h 30 min", 120 -> "2 h". */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
