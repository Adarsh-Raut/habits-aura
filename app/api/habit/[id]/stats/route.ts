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
    select: {
      id: true,
      title: true,
      createdAt: true,
      currentStreak: true,
      longestStreak: true,
      user: {
        select: { email: true },
      },
      completions: {
        where: { action: "COMPLETED" },
        select: { dateKey: true },
      },
    },
  });

  if (!habit || habit.user.email !== session.user.email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const calendar: Record<string, number> = {};

  habit.completions.forEach((entry) => {
    calendar[entry.dateKey] = 1;
  });

  return NextResponse.json({
    habitId: habit.id,
    title: habit.title,
    createdAt: habit.createdAt,
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
    calendar,
  });
}
