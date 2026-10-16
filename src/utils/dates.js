// Local-date helpers.
//
// Diary keys are "YYYY-MM-DD" strings that must always reflect the user's
// *local* calendar day. Using `toISOString()` here is a real bug: it converts
// to UTC, so anyone east of UTC (e.g. UTC+5:30) would get yesterday's diary
// key for part of every evening, and date navigation would skip a day.

/**
 * Formats a Date as a local "YYYY-MM-DD" key.
 */
export function toDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return toDateKey(new Date());

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Today's local date key. */
export function todayKey() {
  return toDateKey(new Date());
}

/**
 * Parses a "YYYY-MM-DD" key into a Date at local midnight
 * (avoiding the UTC shift that `new Date('2026-01-01')` causes).
 */
export function fromDateKey(dateKey) {
  if (!dateKey) return new Date();
  const [y, m, d] = String(dateKey).split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

/** Shifts a date key by whole days, staying on the local calendar. */
export function addDays(dateKey, amount) {
  const d = fromDateKey(dateKey);
  d.setDate(d.getDate() + amount);
  return toDateKey(d);
}

/** True when the key represents today's local calendar day. */
export function isTodayKey(dateKey) {
  return dateKey === todayKey();
}

/** Human-friendly date label, e.g. "Mon, Oct 16". */
export function formatDateLabel(dateKey) {
  return fromDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}