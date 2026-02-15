import HabitList from "@/app/components/HabitList";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Habit } from "@/app/types/habit";

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const today = getToday();

  const dbHabits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    include: {
      completions: {
        where: { date: today },
        select: { action: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const habits: Habit[] = dbHabits.map((habit) => ({
    id: habit.id,
    title: habit.title,
    createdAt: habit.createdAt,
    status: habit.completions[0]?.action ?? "NONE",
  }));

  return <HabitList initialHabits={habits} />;
}
