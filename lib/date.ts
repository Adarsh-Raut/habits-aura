/**
 * Date helpers.
 *
 * A "date key" is a calendar day string ("YYYY-MM-DD") in the USER's time zone.
 * All calendar arithmetic happens on date keys via UTC, so it never depends on
 * the server's local time zone or DST.
 */

export type DayKey = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
export const DAY_KEYS: DayKey[] = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];
export const TZ_COOKIE = "tz";
export const DEFAULT_TIME_ZONE = "UTC";

export function resolveTimeZone(timeZone?: string | null): string {
  if (!timeZone) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

/** Calendar day of an instant, as seen in `timeZone`. */
export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function getTodayDateKey(timeZone: string, now: Date = new Date()) {
  return dateKeyInTimeZone(now, timeZone);
}

/** UTC-midnight Date for a date key (used for the `date` DB column). */
export function dateKeyToDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDaysToKey(dateKey: string, days: number): string {
  const date = dateKeyToDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function weekdayKeyOfDateKey(dateKey: string): DayKey {
  return DAY_KEYS[dateKeyToDate(dateKey).getUTCDay()];
}

export function getTodayWeekdayKey(timeZone: string, now: Date = new Date()) {
  return weekdayKeyOfDateKey(getTodayDateKey(timeZone, now));
}

export function isTodayHabitDay(
  habitDays: string[],
  timeZone: string,
  now: Date = new Date(),
): boolean {
  return habitDays.includes(getTodayWeekdayKey(timeZone, now));
}

export function getDayIndex(dayKey: string) {
  return DAY_KEYS.indexOf(dayKey as DayKey);
}

export function getNextHabitDayFromWeekday(
  habitDays: string[],
  weekdayKey: string,
): string | null {
  if (habitDays.length === 0) return null;

  const currentDay = getDayIndex(weekdayKey);
  if (currentDay === -1) return null;

  for (let i = 0; i < 7; i++) {
    const dayKey = DAY_KEYS[(currentDay + i) % 7];
    if (habitDays.includes(dayKey)) return dayKey;
  }

  return null;
}
