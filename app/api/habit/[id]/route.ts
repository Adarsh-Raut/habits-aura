import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDate, getTodayDateKey, DAY_KEYS, isTodayHabitDay } from "@/lib/date";
import { AURA_DELTA } from "@/lib/aura";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { habitToggleLimiter, habitDeleteLimiter } from "@/lib/ratelimit";

function calculateStreaks(
  completions: { dateKey: string }[],
  habitDays: string[],
  habitCreatedAt: Date,
): { currentStreak: number; longestStreak: number } {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const completionMap = new Set(completions.map((c) => c.dateKey));

  const createdDate = new Date(habitCreatedAt);
  createdDate.setHours(0, 0, 0, 0);
  const createdDateKey = createdDate.toISOString().split("T")[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate current streak (from today going backwards)
  let currentStreak = 0;

  for (let i = 0; i < 1825; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - i);
    const dateKey = currentDate.toISOString().split("T")[0];

    if (dateKey < createdDateKey) {
      break;
    }

    const weekday = DAY_KEYS[currentDate.getDay()];

    if (habitDays.includes(weekday)) {
      if (completionMap.has(dateKey)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak (from creation date going forward)
  let longestStreak = 0;
  let tempStreak = 0;
  const maxDate = new Date(today);

  for (let d = new Date(createdDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split("T")[0];
    const weekday = DAY_KEYS[d.getDay()];

    if (habitDays.includes(weekday)) {
      if (completionMap.has(dateKey)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
  }

  return { currentStreak, longestStreak };
}

async function updateHabitStreaks(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  habitId: string,
  habitDays: string[],
  habitCreatedAt: Date,
): Promise<{ currentStreak: number; longestStreak: number }> {
  const completions = await tx.habitCompletion.findMany({
    where: { habitId, action: "COMPLETED" },
    select: { dateKey: true },
    orderBy: { dateKey: "asc" },
  });

  const streaks = calculateStreaks(completions, habitDays, habitCreatedAt);

  await tx.habit.update({
    where: { id: habitId },
    data: streaks,
  });

  return streaks;
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

  const { success, remaining, reset } = await habitToggleLimiter.limit(session.user.id);

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      },
    );
  }

  const habitId = params.id;
  const today = getTodayDate();
  const todayKey = getTodayDateKey();

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { id: true, userId: true, days: true, createdAt: true },
  });

  if (!habit || habit.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isTodayHabitDay(habit.days)) {
    return NextResponse.json(
      { error: "Cannot toggle habit on non-scheduled days" },
      { status: 400 }
    );
  }

  let currentStreak = 0;
  let longestStreak = 0;

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

      const streaks = await updateHabitStreaks(tx, habitId, habit.days, habit.createdAt);
      currentStreak = streaks.currentStreak;
      longestStreak = streaks.longestStreak;

      return;
    }

    if (existing.action === "COMPLETED") {
      await tx.habitCompletion.update({
        where: { id: existing.id },
        data: { action: "SKIPPED" },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { auraPoints: { decrement: AURA_DELTA } },
      });

      const streaks = await updateHabitStreaks(tx, habitId, habit.days, habit.createdAt);
      currentStreak = streaks.currentStreak;
      longestStreak = streaks.longestStreak;

      return;
    }

    await tx.habitCompletion.delete({
      where: { id: existing.id },
    });

    const streaks = await updateHabitStreaks(tx, habitId, habit.days, habit.createdAt);
    currentStreak = streaks.currentStreak;
    longestStreak = streaks.longestStreak;
  });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");

  return NextResponse.json({ 
    ok: true, 
    currentStreak, 
    longestStreak 
  });
}

/* ---------------- EDIT HABIT ---------------- */

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habitId = params.id;

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { id: true, userId: true, days: true, createdAt: true },
  });

  if (!habit || habit.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, days } = body;

  if (!title || !Array.isArray(days)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const newDays = days;
  const todayKey = getTodayDateKey();
  const todayWeekday = DAY_KEYS[new Date().getDay()];

  const daysRemoved = habit.days.filter((d) => !newDays.includes(d));
  const todayWasRemoved = daysRemoved.includes(todayWeekday);

  let deletedCompletionAction = null;

  await prisma.$transaction(async (tx) => {
    if (todayWasRemoved) {
      const existingCompletion = await tx.habitCompletion.findUnique({
        where: {
          habitId_dateKey: {
            habitId,
            dateKey: todayKey,
          },
        },
      });

      if (existingCompletion) {
        deletedCompletionAction = existingCompletion.action;
        await tx.habitCompletion.delete({
          where: { id: existingCompletion.id },
        });

        if (existingCompletion.action === "COMPLETED") {
          await tx.user.update({
            where: { id: session.user.id },
            data: { auraPoints: { decrement: AURA_DELTA } },
          });
        }
      }
    }

    await tx.habit.update({
      where: { id: habitId },
      data: {
        title: title.trim(),
        days: newDays,
      },
    });

    await updateHabitStreaks(tx, habitId, newDays, habit.createdAt);
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

  const { success, remaining, reset } = await habitDeleteLimiter.limit(session.user.id);

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      },
    );
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

  const completions = await prisma.habitCompletion.findMany({
    where: { habitId: params.id },
    select: { action: true },
  });

  const completedCount = completions.filter((c) => c.action === "COMPLETED").length;
  const skippedCount = completions.filter((c) => c.action === "SKIPPED").length;
  const refund = completedCount * AURA_DELTA + skippedCount * AURA_DELTA;

  if (refund > 0) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { auraPoints: { decrement: refund } },
    });
  }

  await prisma.habit.delete({
    where: { id: params.id },
  });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");

  return NextResponse.json({ ok: true });
}
