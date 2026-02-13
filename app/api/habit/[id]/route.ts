import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDate } from "@/lib/date";
import { AURA_DELTA } from "@/lib/aura";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const today = getTodayDate();

  const habit = await prisma.habit.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!habit) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  const existing = await prisma.habitCompletion.findUnique({
    where: {
      habitId_date: {
        habitId: params.id,
        date: today,
      },
    },
  });

  // STATE MACHINE
  if (!existing) {
    // ⬜ → ✅
    await prisma.$transaction([
      prisma.habitCompletion.create({
        data: {
          habitId: params.id,
          date: today,
          action: "COMPLETED",
        },
      }),
      prisma.user.update({
        where: { id: habit.userId },
        data: { auraPoints: { increment: AURA_DELTA } },
      }),
    ]);
  } else if (existing.action === "COMPLETED") {
    // ✅ → ❌
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
    // ❌ → ⬜
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

  return NextResponse.json({ success: true });
}
