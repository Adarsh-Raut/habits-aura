import StatsView from "../components/StatsView";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      currentStreak: true,
      longestStreak: true,
      createdAt: true,
      completions: {
        where: { action: "COMPLETED" },
        select: { dateKey: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const habitsWithStats = habits.map((habit) => ({
    id: habit.id,
    title: habit.title,
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
    createdAt: habit.createdAt.toISOString(),
    calendar: habit.completions.reduce(
      (acc, c) => {
        acc[c.dateKey] = 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  }));

  return <StatsView habits={habitsWithStats} />;
}
