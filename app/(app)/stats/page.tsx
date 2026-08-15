import StatsView from "@/app/components/StatsView";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayDateKey } from "@/lib/date";
import { calculateStreaks } from "@/lib/streaks";
import { buildHabitStats } from "@/lib/stats";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const todayKey = getTodayDateKey();
  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      createdAt: true,
      days: true,
      completions: {
        where: { action: "COMPLETED" },
        select: { dateKey: true },
        orderBy: { dateKey: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const habitSummaries = habits.map((habit) => {
    const streaks = calculateStreaks(
      habit.completions,
      habit.days,
      habit.createdAt,
      { graceToday: true },
    );

    return {
      id: habit.id,
      title: habit.title,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
    };
  });

  const initialStats = habits.length > 0 ? buildHabitStats(habits[0]) : null;

  return <StatsView habits={habitSummaries} todayKey={todayKey} initialStats={initialStats} />;
}
