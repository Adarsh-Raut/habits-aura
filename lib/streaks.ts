import { DAY_KEYS } from "@/lib/date";

export function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

export function dateKeyFromDate(date: Date) {
  return startOfDay(date).toISOString().split("T")[0];
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getPreviousScheduledDate(
  date: Date,
  habitDaySet: Set<string>,
  createdDate: Date,
) {
  const cursor = startOfDay(date);
  cursor.setDate(cursor.getDate() - 1);

  while (cursor >= createdDate) {
    if (habitDaySet.has(DAY_KEYS[cursor.getDay()])) {
      return new Date(cursor);
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return null;
}

export function getLatestScheduledDateOnOrBefore(
  date: Date,
  habitDaySet: Set<string>,
  createdDate: Date,
) {
  const cursor = startOfDay(date);

  while (cursor >= createdDate) {
    if (habitDaySet.has(DAY_KEYS[cursor.getDay()])) {
      return new Date(cursor);
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return null;
}

export function getNextScheduledDate(
  date: Date,
  habitDaySet: Set<string>,
  today: Date,
) {
  const cursor = startOfDay(date);
  cursor.setDate(cursor.getDate() + 1);

  while (cursor <= today) {
    if (habitDaySet.has(DAY_KEYS[cursor.getDay()])) {
      return new Date(cursor);
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return null;
}

export function calculateStreaks(
  completions: { dateKey: string }[],
  habitDays: string[],
  habitCreatedAt: Date,
  options?: { graceToday?: boolean },
): { currentStreak: number; longestStreak: number } {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const habitDaySet = new Set(habitDays);
  const createdDate = startOfDay(habitCreatedAt);
  const today = startOfDay(new Date());
  const completedKeys = new Set<string>();
  const completedDates: Date[] = [];

  for (const completion of completions) {
    const completionDate = parseDateKey(completion.dateKey);

    if (
      completionDate < createdDate ||
      !habitDaySet.has(DAY_KEYS[completionDate.getDay()])
    ) {
      continue;
    }

    completedKeys.add(completion.dateKey);
    completedDates.push(completionDate);
  }

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let expectedCurrentDate = getLatestScheduledDateOnOrBefore(
    today,
    habitDaySet,
    createdDate,
  );

  if (
    options?.graceToday &&
    expectedCurrentDate &&
    dateKeyFromDate(expectedCurrentDate) === dateKeyFromDate(today) &&
    !completedKeys.has(dateKeyFromDate(expectedCurrentDate))
  ) {
    expectedCurrentDate = getPreviousScheduledDate(
      expectedCurrentDate,
      habitDaySet,
      createdDate,
    );
  }

  while (expectedCurrentDate) {
    if (!completedKeys.has(dateKeyFromDate(expectedCurrentDate))) {
      break;
    }

    currentStreak++;
    expectedCurrentDate = getPreviousScheduledDate(
      expectedCurrentDate,
      habitDaySet,
      createdDate,
    );
  }

  let longestStreak = 0;
  let streak = 0;
  let previousCompletionDate: Date | null = null;

  for (const completionDate of completedDates) {
    if (!previousCompletionDate) {
      streak = 1;
      longestStreak = 1;
      previousCompletionDate = completionDate;
      continue;
    }

    const expectedNextDate = getNextScheduledDate(
      previousCompletionDate,
      habitDaySet,
      today,
    );

    streak =
      expectedNextDate &&
      dateKeyFromDate(expectedNextDate) === dateKeyFromDate(completionDate)
        ? streak + 1
        : 1;

    longestStreak = Math.max(longestStreak, streak);
    previousCompletionDate = completionDate;
  }

  return { currentStreak, longestStreak };
}