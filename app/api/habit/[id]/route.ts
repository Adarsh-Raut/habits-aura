import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDate, getTodayDateKey, DAY_KEYS } from "@/lib/date";
import { AURA_DELTA } from "@/lib/aura";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function calculateStreaks(
  completions: { dateKey: string }[],
  habitDays: string[],
): { currentStreak: number; longestStreak: number } {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const completionMap = new Set(completions.map((c) => c.dateKey));
  const sortedDates = Array.from(completionMap).sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 1825; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - i);
    const dateKey = currentDate.toISOString().split("T")[0];
    const weekday = DAY_KEYS[currentDate.getDay()];

    if (habitDays.includes(weekday)) {
      if (completionMap.has(dateKey)) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        if (i === 0) {
          currentStreak = 0;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (currentStreak === 0 && i > 0) {
          break;
        }
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak };
}

async function updateHabitStreaks(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  habitId: string,
  habitDays: string[],
) {
  const completions = await tx.habitCompletion.findMany({
    where: { habitId, action: "COMPLETED" },
    select: { dateKey: true },
    orderBy: { dateKey: "asc" },
  });

  const { currentStreak, longestStreak } = calculateStreaks(
    completions,
    habitDays,
  );

  await tx.habit.update({
    where: { id: habitId },
    data: { currentStreak, longestStreak },
  });
}

/**
 * NONE -> COMPLETED
 * COMPLETED -> SKIPPED
 * SKIPPED -> NONE (delete row)
 */
export async function PATCH(
  _: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habitId = params.id;
  const today = getTodayDate();
  const todayKey = getTodayDateKey();

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { id: true, userId: true, days: true },
  });

  if (!habit || habit.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.habitCompletion.findUnique({
      where: {
        habitId_dateKey: {
          habitId,
          dateKey: todayKey,
        },
      },
      select: { id: true, action: true },
    });

    if (!existing) {
      await tx.habitCompletion.create({
        data: {
          habitId,
          date: today,
          dateKey: todayKey,
          action: "COMPLETED",
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { auraPoints: { increment: AURA_DELTA } },
      });

      await updateHabitStreaks(tx, habitId, habit.days);

      return;
    }

    if (existing.action === "COMPLETED") {
      await tx.habitCompletion.update({
        where: { id: existing.id },
        data: { action: "SKIPPED" },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { auraPoints: { decrement: AURA_DELTA * 2 } },
      });

      await updateHabitStreaks(tx, habitId, habit.days);

      return;
    }

    await tx.habitCompletion.delete({
      where: { id: existing.id },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: { auraPoints: { increment: AURA_DELTA } },
    });

    await updateHabitStreaks(tx, habitId, habit.days);
  });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");

  return NextResponse.json({ ok: true });
}

/* ---------------- DELETE HABIT ---------------- */

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habit = await prisma.habit.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.habit.delete({
    where: { id: params.id },
  });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");

  return NextResponse.json({ ok: true });
}
