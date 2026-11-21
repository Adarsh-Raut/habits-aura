import { prisma } from "@/lib/prisma";
import { addDaysToKey, getTodayDateKey } from "@/lib/date";
import { calculateStreaks } from "@/lib/streaks";
import type { Habit } from "@/app/types/habit";

/**
 * The habit list only needs recent history (today's status + current streak),
 * so completions are limited to this window instead of loading every row ever.
 * Current streaks longer than the window are capped at roughly this length.
 */
const LIST_HISTORY_DAYS = 800;

function habitSelect(timeZone: string) {
  const since = addDaysToKey(getTodayDateKey(timeZone), -LIST_HISTORY_DAYS);

  return {
    id: true,
    title: true,
    createdAt: true,
    days: true,
    completions: {
      where: { dateKey: { gte: since } },
      select: { dateKey: true, action: true },
      orderBy: { dateKey: "asc" },
    },
  } as const;
}

type DbHabitWithCompletions = {
  id: string;
  title: string;
  createdAt: Date;
  days: string[];
  completions: { dateKey: string; action: "COMPLETED" | "SKIPPED" }[];
};

/** Streaks are always computed from completions, never stored. */
export function toHabit(
  habit: DbHabitWithCompletions,
  timeZone: string,
): Habit {
  const todayKey = getTodayDateKey(timeZone);
  const completed = habit.completions.filter((c) => c.action === "COMPLETED");
  const today = habit.completions.find((c) => c.dateKey === todayKey);

  return {
    id: habit.id,
    title: habit.title,
    createdAt: habit.createdAt,
    status: today?.action ?? "NONE",
    streak: calculateStreaks(completed, habit.days, habit.createdAt, {
      timeZone,
      graceToday: true,
    }).currentStreak,
    days: habit.days,
  };
}

export async function getHabitsForUser(
  userId: string,
  timeZone: string,
): Promise<Habit[]> {
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: habitSelect(timeZone),
    orderBy: { createdAt: "asc" },
  });

  return habits.map((habit) => toHabit(habit, timeZone));
}

export async function getHabitForUser(
  userId: string,
  habitId: string,
  timeZone: string,
): Promise<Habit | null> {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: habitSelect(timeZone),
  });

  return habit ? toHabit(habit, timeZone) : null;
}
