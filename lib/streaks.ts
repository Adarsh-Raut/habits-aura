import {
  addDaysToKey,
  dateKeyInTimeZone,
  getTodayDateKey,
  weekdayKeyOfDateKey,
} from "./date";

type StreakOptions = {
  timeZone: string;
  /** Override "now" (tests). */
  now?: Date;
  /** Don't break the streak if today is scheduled but not done yet. */
  graceToday?: boolean;
};

function previousScheduledKey(
  dateKey: string,
  days: Set<string>,
  createdKey: string,
): string | null {
  let cursor = addDaysToKey(dateKey, -1);
  while (cursor >= createdKey) {
    if (days.has(weekdayKeyOfDateKey(cursor))) return cursor;
    cursor = addDaysToKey(cursor, -1);
  }
  return null;
}

function latestScheduledKeyOnOrBefore(
  dateKey: string,
  days: Set<string>,
  createdKey: string,
): string | null {
  let cursor = dateKey;
  while (cursor >= createdKey) {
    if (days.has(weekdayKeyOfDateKey(cursor))) return cursor;
    cursor = addDaysToKey(cursor, -1);
  }
  return null;
}

export function calculateStreaks(
  completions: { dateKey: string }[],
  habitDays: string[],
  habitCreatedAt: Date,
  options: StreakOptions,
): { currentStreak: number; longestStreak: number } {
  const days = new Set(habitDays);
  const createdKey = dateKeyInTimeZone(habitCreatedAt, options.timeZone);
  const todayKey = getTodayDateKey(options.timeZone, options.now);

  // Only completions on scheduled days, on/after creation, not in the future.
  const completed = new Set<string>();
  for (const { dateKey } of completions) {
    if (
      dateKey >= createdKey &&
      dateKey <= todayKey &&
      days.has(weekdayKeyOfDateKey(dateKey))
    ) {
      completed.add(dateKey);
    }
  }

  if (completed.size === 0) return { currentStreak: 0, longestStreak: 0 };

  // Current streak: walk back from the latest scheduled day.
  let currentStreak = 0;
  let expected = latestScheduledKeyOnOrBefore(todayKey, days, createdKey);

  if (
    options.graceToday &&
    expected === todayKey &&
    !completed.has(todayKey)
  ) {
    expected = previousScheduledKey(todayKey, days, createdKey);
  }

  while (expected && completed.has(expected)) {
    currentStreak++;
    expected = previousScheduledKey(expected, days, createdKey);
  }

  // Longest streak: a completion extends the run if the previous scheduled
  // day was also completed.
  let longestStreak = 0;
  const runAt = new Map<string, number>();
  for (const key of Array.from(completed).sort()) {
    const prev = previousScheduledKey(key, days, createdKey);
    const run = prev && completed.has(prev) ? (runAt.get(prev) ?? 0) + 1 : 1;
    runAt.set(key, run);
    if (run > longestStreak) longestStreak = run;
  }

  return { currentStreak, longestStreak };
}
