import HabitList from "@/app/components/HabitList";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Habit } from "@/app/types/habit";
import { getTodayDateKey } from "@/lib/date";

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
    const todayCompletion = habit.completions.find((c) => c.dateKey === todayKey);
    return {
      id: habit.id,
      title: habit.title,
      createdAt: habit.createdAt,
      status: todayCompletion?.action ?? "NONE",
    };
  });

  return <HabitList initialHabits={habits} />;
}
