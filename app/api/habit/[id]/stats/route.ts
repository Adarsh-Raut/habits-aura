import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habit = await prisma.habit.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      completions: {
        where: { action: "COMPLETED" },
        orderBy: { dateKey: "asc" },
      },
    },
  });

  if (!habit || habit.user.email !== session.user.email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let prevKey: string | null = null;

  habit.completions.forEach((entry) => {
    const currKey = entry.dateKey;

    if (!prevKey) {
      currentStreak = 1;
    } else {
      const prev = new Date(prevKey);
      const curr = new Date(currKey);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) currentStreak++;
      else currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    prevKey = currKey;
  });

  const calendar: Record<string, number> = {};

  habit.completions.forEach((entry) => {
    calendar[entry.dateKey] = 1;
  });

  return NextResponse.json({
    habitId: habit.id,
    title: habit.title,
    createdAt: habit.createdAt,
    currentStreak,
    longestStreak,
    calendar,
  });
}
