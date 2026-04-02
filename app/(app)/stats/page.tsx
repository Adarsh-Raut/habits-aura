import StatsView from "@/app/components/StatsView";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayDateKey } from "@/lib/date";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const todayKey = getTodayDateKey();
  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      currentStreak: true,
      longestStreak: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const habitSummaries = habits.map((habit) => ({
    id: habit.id,
    title: habit.title,
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
  }));

  return <StatsView habits={habitSummaries} todayKey={todayKey} />;
}
