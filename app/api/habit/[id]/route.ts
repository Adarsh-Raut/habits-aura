import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDate, getTodayDateKey } from "@/lib/date";
import { AURA_DELTA } from "@/lib/aura";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const today = getTodayDate();
  const todayKey = getTodayDateKey();

  const habit = await prisma.habit.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!habit) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  const existing = await prisma.habitCompletion.findUnique({
    where: {
      habitId_dateKey: {
        habitId: params.id,
        dateKey: todayKey,
      },
    },
  });

  if (!existing) {
    await prisma.$transaction([
      prisma.habitCompletion.create({
        data: {
          habitId: params.id,
          date: today,
          dateKey: todayKey,
          action: "COMPLETED",
        },
      }),
      prisma.user.update({
        where: { id: habit.userId },
        data: { auraPoints: { increment: AURA_DELTA } },
      }),
    ]);
  } else if (existing.action === "COMPLETED") {
    await prisma.$transaction([
      prisma.habitCompletion.update({
        where: { id: existing.id },
        data: { action: "SKIPPED" },
      }),
      prisma.user.update({
        where: { id: habit.userId },
        data: { auraPoints: { decrement: AURA_DELTA * 2 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.habitCompletion.delete({
        where: { id: existing.id },
      }),
      prisma.user.update({
        where: { id: habit.userId },
        data: { auraPoints: { increment: AURA_DELTA } },
      }),
    ]);
  }
  revalidatePath("/leaderboard");
  revalidatePath("/");
  revalidatePath("/stats");

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habit = await prisma.habit.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!habit || habit.user.email !== session.user.email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.habit.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
