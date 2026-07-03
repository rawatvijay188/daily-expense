import {
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

/** Local calendar date as 'YYYY-MM-DD' (SQLite-friendly, timezone-safe). */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export type DateRange = { from: string; to: string };

export function monthRange(date: Date = new Date()): DateRange {
  return { from: toDateKey(startOfMonth(date)), to: toDateKey(endOfMonth(date)) };
}

export function weekRange(date: Date = new Date()): DateRange {
  return {
    from: toDateKey(startOfWeek(date, { weekStartsOn: 1 })),
    to: toDateKey(endOfWeek(date, { weekStartsOn: 1 })),
  };
}

export function dayRange(date: Date = new Date()): DateRange {
  const key = toDateKey(date);
  return { from: key, to: key };
}

/** Human label for a stored 'YYYY-MM-DD' key, e.g. "Mon, 3 Jul 2026". */
export function formatDateKey(key: string): string {
  return format(parseISO(key), 'EEE, d MMM yyyy');
}

/** Short label for grouping headers, e.g. "3 Jul". */
export function formatShortDate(key: string): string {
  return format(parseISO(key), 'd MMM');
}
