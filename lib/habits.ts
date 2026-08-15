import { prisma } from "@/lib/prisma";
import { getTodayDateKey } from "@/lib/date";
import { calculateStreaks } from "@/lib/streaks";
import type { Habit } from "@/app/types/habit";

export async function getHabitsForUser(userId: string): Promise<Habit[]> {
  const dbHabits = await prisma.habit.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      days: true,
      completions: {
        select: { dateKey: true, action: true },
        orderBy: { dateKey: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const todayKey = getTodayDateKey();

  return dbHabits.map((habit) => {
    const completedDateKeys = habit.completions
      .filter((completion) => completion.action === "COMPLETED")
      .map((completion) => ({ dateKey: completion.dateKey }));
    const todayCompletion = habit.completions.find(
      (completion) => completion.dateKey === todayKey,
    );

    return {
      id: habit.id,
      title: habit.title,
      createdAt: habit.createdAt,
      status: todayCompletion?.action ?? "NONE",
      streak: calculateStreaks(completedDateKeys, habit.days, habit.createdAt, {
        graceToday: true,
      }).currentStreak,
      days: habit.days,
    };
  });
}