import { calculateStreaks, dateKeyFromDate, startOfDay } from "@/lib/streaks";

const HEATMAP_DAYS = 365;

export type HabitStatsData = {
  habitId: string;
  title: string;
  windowStart: string;
  currentStreak: number;
  longestStreak: number;
  calendar: Record<string, number>;
};

export function buildHabitStats(input: {
  id: string;
  title: string;
  createdAt: Date;
  days: string[];
  completions: { dateKey: string }[];
}): HabitStatsData {
  const today = startOfDay(new Date());
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(oneYearAgo.getDate() - (HEATMAP_DAYS - 1));
  const oneYearAgoKey = dateKeyFromDate(oneYearAgo);

  const streaks = calculateStreaks(
    input.completions,
    input.days,
    input.createdAt,
    { graceToday: true },
  );

  const calendar: Record<string, number> = {};

  for (const entry of input.completions) {
    if (entry.dateKey >= oneYearAgoKey) {
      calendar[entry.dateKey] = 1;
    }
  }

  return {
    habitId: input.id,
    title: input.title,
    windowStart: startOfDay(
      input.createdAt > oneYearAgo ? input.createdAt : oneYearAgo,
    ).toISOString(),
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    calendar,
  };
}