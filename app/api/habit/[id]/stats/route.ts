import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreaks, startOfDay } from "@/lib/streaks";

const HEATMAP_DAYS = 365;

function dateKeyFromDate(date: Date) {
  return startOfDay(date).toISOString().split("T")[0];
}

export async function GET(
  _: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(oneYearAgo.getDate() - (HEATMAP_DAYS - 1));
  const oneYearAgoKey = dateKeyFromDate(oneYearAgo);

  const habit = await prisma.habit.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      createdAt: true,
      days: true,
      userId: true,
      completions: {
        where: { action: "COMPLETED" },
        select: { dateKey: true },
        orderBy: { dateKey: "asc" },
      },
    },
  });

  if (!habit || habit.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const streaks = calculateStreaks(
    habit.completions,
    habit.days,
    habit.createdAt,
    { graceToday: true },
  );

  const calendar: Record<string, number> = {};

  for (const entry of habit.completions) {
    if (entry.dateKey >= oneYearAgoKey) {
      calendar[entry.dateKey] = 1;
    }
  }

  return NextResponse.json({
    habitId: habit.id,
    title: habit.title,
    windowStart: startOfDay(
      habit.createdAt > oneYearAgo ? habit.createdAt : oneYearAgo,
    ).toISOString(),
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    calendar,
  });
}
