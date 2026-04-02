import HabitList from "@/app/components/HabitList";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Habit } from "@/app/types/habit";
import { getTodayDateKey, getTodayWeekdayKey } from "@/lib/date";

export default async function Page() {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const todayKey = getTodayDateKey();
  const todayWeekdayKey = getTodayWeekdayKey();

  const dbHabits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      createdAt: true,
      currentStreak: true,
      days: true,
      completions: {
        where: { dateKey: todayKey },
        select: { action: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const habits: Habit[] = dbHabits.map((habit) => {
    const todayCompletion = habit.completions[0];

    return {
      id: habit.id,
      title: habit.title,
      createdAt: habit.createdAt,
      status: todayCompletion?.action ?? "NONE",
      streak: habit.currentStreak,
      days: habit.days,
    };
  });

  return <HabitList initialHabits={habits} todayWeekdayKey={todayWeekdayKey} />;
}
