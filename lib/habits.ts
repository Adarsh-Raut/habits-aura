import { prisma } from "@/lib/prisma";
import { getTodayDateKey } from "@/lib/date";
import { calculateStreaks } from "@/lib/streaks";
import type { Habit } from "@/app/types/habit";

const habitSelect = {
  id: true,
  title: true,
  createdAt: true,
  days: true,
  completions: {
    select: { dateKey: true, action: true },
    orderBy: { dateKey: "asc" },
  },
} as const;

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
    select: habitSelect,
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
    select: habitSelect,
  });

  return habit ? toHabit(habit, timeZone) : null;
}
