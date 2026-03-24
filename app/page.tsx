import HabitList from "@/app/components/HabitList";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Habit } from "@/app/types/habit";
import { getTodayDateKey, DAY_KEYS } from "@/lib/date";

function calculateStreak(
  completions: { dateKey: string; action: string }[],
  habitDays: string[],
): number {
  const completionMap = new Map(
    completions.map((c) => [c.dateKey, c.action]),
  );

  const sortedDates = Array.from(completionMap.keys()).sort().reverse();

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateKey = currentDate.toISOString().split("T")[0];
    const weekday = DAY_KEYS[currentDate.getDay()];

    if (habitDays.includes(weekday)) {
      const action = completionMap.get(dateKey);

      if (action === "COMPLETED") {
        streak++;
      } else {
        if (dateKey !== today.toISOString().split("T")[0]) {
          break;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() - 1);

    if (currentDate < new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)) {
      break;
    }
  }

  return streak;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const todayKey = getTodayDateKey();

  const dbHabits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    include: {
      completions: {
        select: { action: true, dateKey: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const habits: Habit[] = dbHabits.map((habit) => {
    const todayCompletion = habit.completions.find(
      (c) => c.dateKey === todayKey,
    );
    const streak = calculateStreak(habit.completions, habit.days);

    return {
      id: habit.id,
      title: habit.title,
      createdAt: habit.createdAt,
      status: todayCompletion?.action ?? "NONE",
      streak,
    };
  });

  return <HabitList initialHabits={habits} />;
}
