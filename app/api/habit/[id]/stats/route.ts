import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const HEATMAP_DAYS = 365;

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

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
      currentStreak: true,
      longestStreak: true,
      userId: true,
      completions: {
        where: {
          action: "COMPLETED",
          dateKey: {
            gte: oneYearAgoKey,
          },
        },
        select: { dateKey: true },
      },
    },
  });

  if (!habit || habit.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const calendar: Record<string, number> = {};

  habit.completions.forEach((entry) => {
    calendar[entry.dateKey] = 1;
  });

  return NextResponse.json({
    habitId: habit.id,
    title: habit.title,
    windowStart: startOfDay(
      habit.createdAt > oneYearAgo ? habit.createdAt : oneYearAgo,
    ).toISOString(),
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
    calendar,
  });
}
