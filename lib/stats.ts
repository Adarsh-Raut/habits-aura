import { calculateStreaks } from "@/lib/streaks";
import { addDaysToKey, dateKeyInTimeZone, getTodayDateKey } from "@/lib/date";

const HEATMAP_DAYS = 365;

export type HabitStatsData = {
  habitId: string;
  title: string;
  /** Date key (YYYY-MM-DD) of the first day shown on the heatmap. */
  windowStart: string;
  currentStreak: number;
  longestStreak: number;
  calendar: Record<string, number>;
};

export function buildHabitStats(
  input: {
    id: string;
    title: string;
    createdAt: Date;
    days: string[];
    completions: { dateKey: string }[];
  },
  timeZone: string,
): HabitStatsData {
  const todayKey = getTodayDateKey(timeZone);
  const oneYearAgoKey = addDaysToKey(todayKey, -(HEATMAP_DAYS - 1));
  const createdKey = dateKeyInTimeZone(input.createdAt, timeZone);

  const streaks = calculateStreaks(
    input.completions,
    input.days,
    input.createdAt,
    { timeZone, graceToday: true },
  );

  const calendar: Record<string, number> = {};
  for (const entry of input.completions) {
    if (entry.dateKey >= oneYearAgoKey) calendar[entry.dateKey] = 1;
  }

  return {
    habitId: input.id,
    title: input.title,
    windowStart: createdKey > oneYearAgoKey ? createdKey : oneYearAgoKey,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    calendar,
  };
}
