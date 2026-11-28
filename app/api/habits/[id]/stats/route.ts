import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildHabitStats } from "@/lib/stats";
import { getUserTimeZone } from "@/lib/timezone";

export async function GET(
  _: Request,
  { params }: { params: { id: string } },
) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  return NextResponse.json(buildHabitStats(habit, getUserTimeZone()));
}