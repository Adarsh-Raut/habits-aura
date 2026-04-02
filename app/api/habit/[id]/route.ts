import { NextResponse } from "next/server";
import type { HabitAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getTodayDate,
  getTodayDateKey,
  DAY_KEYS,
  isTodayHabitDay,
} from "@/lib/date";
import { AURA_DELTA } from "@/lib/aura";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { habitToggleLimiter, habitDeleteLimiter } from "@/lib/ratelimit";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function dateKeyFromDate(date: Date) {
  return startOfDay(date).toISOString().split("T")[0];
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getPreviousScheduledDate(
  date: Date,
  habitDaySet: Set<string>,
  createdDate: Date,
) {
  const cursor = startOfDay(date);
  cursor.setDate(cursor.getDate() - 1);

  while (cursor >= createdDate) {
    if (habitDaySet.has(DAY_KEYS[cursor.getDay()])) {
      return new Date(cursor);
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return null;
}

function getLatestScheduledDateOnOrBefore(
  date: Date,
  habitDaySet: Set<string>,
  createdDate: Date,
) {
  const cursor = startOfDay(date);

  while (cursor >= createdDate) {
    if (habitDaySet.has(DAY_KEYS[cursor.getDay()])) {
      return new Date(cursor);
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return null;
}

function getNextScheduledDate(
  date: Date,
  habitDaySet: Set<string>,
  today: Date,
) {
  const cursor = startOfDay(date);
  cursor.setDate(cursor.getDate() + 1);

  while (cursor <= today) {
    if (habitDaySet.has(DAY_KEYS[cursor.getDay()])) {
      return new Date(cursor);
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return null;
}

function calculateStreaks(
  completions: { dateKey: string }[],
  habitDays: string[],
  habitCreatedAt: Date,
): { currentStreak: number; longestStreak: number } {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const habitDaySet = new Set(habitDays);
  const createdDate = startOfDay(habitCreatedAt);
  const today = startOfDay(new Date());
  const completedKeys = new Set<string>();
  const completedDates: Date[] = [];

  for (const completion of completions) {
    const completionDate = parseDateKey(completion.dateKey);

    if (
      completionDate < createdDate ||
      !habitDaySet.has(DAY_KEYS[completionDate.getDay()])
    ) {
      continue;
    }

    completedKeys.add(completion.dateKey);
    completedDates.push(completionDate);
  }

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let expectedCurrentDate = getLatestScheduledDateOnOrBefore(
    today,
    habitDaySet,
    createdDate,
  );

  while (expectedCurrentDate) {
    if (!completedKeys.has(dateKeyFromDate(expectedCurrentDate))) {
      break;
    }

    currentStreak++;
    expectedCurrentDate = getPreviousScheduledDate(
      expectedCurrentDate,
      habitDaySet,
      createdDate,
    );
  }

  let longestStreak = 0;
  let streak = 0;
  let previousCompletionDate: Date | null = null;

  for (const completionDate of completedDates) {
    if (!previousCompletionDate) {
      streak = 1;
      longestStreak = 1;
      previousCompletionDate = completionDate;
      continue;
    }

    const expectedNextDate = getNextScheduledDate(
      previousCompletionDate,
      habitDaySet,
      today,
    );

    streak =
      expectedNextDate &&
      dateKeyFromDate(expectedNextDate) === dateKeyFromDate(completionDate)
        ? streak + 1
        : 1;

    longestStreak = Math.max(longestStreak, streak);
    previousCompletionDate = completionDate;
  }

  return { currentStreak, longestStreak };
}

async function updateHabitStreaks(
  tx: TxClient,
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

async function persistHabitStreaks(
  tx: TxClient,
  habitId: string,
  streaks: { currentStreak: number; longestStreak: number },
) {
  await tx.habit.update({
    where: { id: habitId },
    data: streaks,
  });
}

async function getCompletedActionForDate(
  tx: TxClient,
  habitId: string,
  dateKey: string,
) {
  const completion = await tx.habitCompletion.findUnique({
    where: {
      habitId_dateKey: {
        habitId,
        dateKey,
      },
    },
    select: { action: true },
  });

  return completion?.action ?? null;
}

async function countCompletedScheduledStreakBackwards(
  tx: TxClient,
  habitId: string,
  fromDate: Date | null,
  habitDaySet: Set<string>,
  createdDate: Date,
) {
  let streak = 0;
  let cursor = fromDate ? startOfDay(fromDate) : null;

  while (cursor) {
    const action = await getCompletedActionForDate(
      tx,
      habitId,
      dateKeyFromDate(cursor),
    );

    if (action !== "COMPLETED") {
      break;
    }

    streak++;
    cursor = getPreviousScheduledDate(cursor, habitDaySet, createdDate);
  }

  return streak;
}

async function applyAuraDelta(tx: TxClient, userId: string, delta: number) {
  if (delta === 0) {
    return;
  }

  await tx.user.update({
    where: { id: userId },
    data:
      delta > 0
        ? { auraPoints: { increment: delta } }
        : { auraPoints: { decrement: Math.abs(delta) } },
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
    select: {
      id: true,
      userId: true,
      days: true,
      createdAt: true,
      currentStreak: true,
      longestStreak: true,
    },
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
  const habitDaySet = new Set(habit.days);
  const createdDate = startOfDay(habit.createdAt);

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

      await applyAuraDelta(tx, session.user.id, AURA_DELTA);

      const previousScheduledDate = getPreviousScheduledDate(
        today,
        habitDaySet,
        createdDate,
      );
      const previousStreak = await countCompletedScheduledStreakBackwards(
        tx,
        habitId,
        previousScheduledDate,
        habitDaySet,
        createdDate,
      );

      currentStreak = previousStreak + 1;
      longestStreak = Math.max(habit.longestStreak, currentStreak);

      await persistHabitStreaks(tx, habitId, {
        currentStreak,
        longestStreak,
      });

      return;
    }

    if (existing.action === "COMPLETED") {
      await tx.habitCompletion.update({
        where: { id: existing.id },
        data: { action: "SKIPPED" },
      });

      await applyAuraDelta(tx, session.user.id, -AURA_DELTA);

      currentStreak = 0;

      if (habit.currentStreak < habit.longestStreak) {
        longestStreak = habit.longestStreak;
        await persistHabitStreaks(tx, habitId, {
          currentStreak,
          longestStreak,
        });
      } else {
        const streaks = await updateHabitStreaks(
          tx,
          habitId,
          habit.days,
          habit.createdAt,
        );
        currentStreak = streaks.currentStreak;
        longestStreak = streaks.longestStreak;
      }

      return;
    }

    await tx.habitCompletion.delete({
      where: { id: existing.id },
    });

    currentStreak = 0;
    longestStreak = habit.longestStreak;

    await persistHabitStreaks(tx, habitId, {
      currentStreak,
      longestStreak,
    });
  });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");
  revalidatePath(`/habit/${habitId}/edit`);

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
  const scheduleChanged =
    newDays.length !== habit.days.length ||
    newDays.some((day) => !habit.days.includes(day));

  const daysRemoved = habit.days.filter((d) => !newDays.includes(d));
  const todayWasRemoved = daysRemoved.includes(todayWeekday);

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
        await tx.habitCompletion.delete({
          where: { id: existingCompletion.id },
        });

        if (existingCompletion.action === "COMPLETED") {
          await applyAuraDelta(tx, session.user.id, -AURA_DELTA);
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

    if (scheduleChanged) {
      await updateHabitStreaks(tx, habitId, newDays, habit.createdAt);
    }
  });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");
  revalidatePath(`/habit/${habitId}/edit`);

  const updatedHabit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      currentStreak: true,
      days: true,
      completions: {
        where: { dateKey: todayKey },
        select: { action: true },
      },
    },
  });

  if (!updatedHabit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: updatedHabit.id,
    title: updatedHabit.title,
    createdAt: updatedHabit.createdAt,
    status: updatedHabit.completions[0]?.action ?? "NONE",
    streak: updatedHabit.currentStreak,
    days: updatedHabit.days,
  });
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

  await prisma.$transaction(async (tx) => {
    const completedCount = await tx.habitCompletion.count({
      where: {
        habitId: params.id,
        action: "COMPLETED" satisfies HabitAction,
      },
    });

    await applyAuraDelta(tx, session.user.id, -(completedCount * AURA_DELTA));

    await tx.habit.delete({
      where: { id: params.id },
    });
  });

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");

  return NextResponse.json({ ok: true });
}
