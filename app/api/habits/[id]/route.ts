import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getTodayDateKey,
  getTodayWeekdayKey,
  isTodayHabitDay,
} from "@/lib/date";
import {
  auraDelta,
  auraForAction,
  auraForCounts,
  type CompletionAction,
} from "@/lib/aura";
import {
  habitDeleteLimiter,
  habitToggleLimiter,
  habitUpdateLimiter,
} from "@/lib/ratelimit";
import { calculateStreaks } from "@/lib/streaks";
import { getHabitForUser, hasHabitTitle, lockHabitTitles } from "@/lib/habits";
import { getUserTimeZone } from "@/lib/timezone";
import { parseHabitInput } from "@/lib/validation";
import {
  badRequest,
  duplicateHabitTitle,
  notFound,
  rateLimitResponse,
  readJson,
  unauthorized,
} from "@/lib/api";

type TxClient = Prisma.TransactionClient;
type Status = "NONE" | CompletionAction;

const NEXT_STATUS: Record<Status, Status> = {
  NONE: "COMPLETED",
  COMPLETED: "SKIPPED",
  SKIPPED: "NONE",
};

/** Serialises concurrent writes to the same habit (double-clicks, 2 tabs). */
async function lockHabit(tx: TxClient, habitId: string, userId: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM habits WHERE id = ${habitId} AND "userId" = ${userId} FOR UPDATE
  `;
  return rows.length > 0;
}

async function applyAuraDelta(tx: TxClient, userId: string, delta: number) {
  if (delta === 0) return;
  await tx.user.update({
    where: { id: userId },
    data: { auraPoints: { increment: delta } },
  });
}

function revalidateHabitPages(habitId?: string) {
  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");
  if (habitId) revalidatePath(`/habit/${habitId}/edit`);
}

/**
 * NONE -> COMPLETED (+aura) -> SKIPPED (-aura) -> NONE
 */
export async function PATCH(
  _: Request,
  { params }: { params: { id: string } },
) {
  const session = await getAppSession();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const limited = rateLimitResponse(await habitToggleLimiter.limit(userId));
  if (limited) return limited;

  const habitId = params.id;
  const timeZone = getUserTimeZone();
  const todayKey = getTodayDateKey(timeZone);

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { days: true, createdAt: true },
  });

  if (!habit) return notFound();

  if (!isTodayHabitDay(habit.days, timeZone)) {
    return badRequest("Cannot toggle habit on non-scheduled days");
  }

  const status = await prisma.$transaction(async (tx) => {
    if (!await lockHabit(tx, habitId, userId)) return null;

    const existing = await tx.habitCompletion.findUnique({
      where: { habitId_dateKey: { habitId, dateKey: todayKey } },
      select: { id: true, action: true },
    });

    const from: Status = existing?.action ?? "NONE";
    const to = NEXT_STATUS[from];

    if (to === "NONE") {
      await tx.habitCompletion.delete({ where: { id: existing!.id } });
    } else if (existing) {
      await tx.habitCompletion.update({
        where: { id: existing.id },
        data: { action: to },
      });
    } else {
      await tx.habitCompletion.create({
        data: {
          habitId,
          dateKey: todayKey,
          action: to,
        },
      });
    }

    await applyAuraDelta(
      tx,
      userId,
      auraDelta(from === "NONE" ? null : from, to === "NONE" ? null : to),
    );

    return to;
  });
  if (!status) return notFound();

  const completions = await prisma.habitCompletion.findMany({
    where: { habitId, action: "COMPLETED" },
    select: { dateKey: true },
  });
  const { currentStreak, longestStreak } = calculateStreaks(
    completions,
    habit.days,
    habit.createdAt,
    { timeZone, graceToday: true },
  );

  revalidateHabitPages(habitId);

  return NextResponse.json({ ok: true, status, currentStreak, longestStreak });
}

/* ---------------- EDIT HABIT ---------------- */

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getAppSession();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const limited = rateLimitResponse(await habitUpdateLimiter.limit(userId));
  if (limited) return limited;

  const parsed = parseHabitInput(await readJson(req));
  if (!parsed.ok) return badRequest(parsed.error);
  const { title, days: newDays } = parsed.value;

  const habitId = params.id;
  const timeZone = getUserTimeZone();
  const todayKey = getTodayDateKey(timeZone);
  const todayWeekday = getTodayWeekdayKey(timeZone);

  const result = await prisma.$transaction(async (tx) => {
    await lockHabitTitles(tx, userId);
    if (!await lockHabit(tx, habitId, userId)) return "missing";
    const habit = await tx.habit.findFirst({
      where: { id: habitId, userId },
      select: { title: true, days: true },
    });
    if (!habit) return "missing";
    if (habit.title !== title && await hasHabitTitle(tx, userId, title, habitId)) {
      return "duplicate";
    }

    // Today is no longer scheduled: drop today's record and its aura.
    if (habit.days.includes(todayWeekday) && !newDays.includes(todayWeekday)) {
      const existing = await tx.habitCompletion.findUnique({
        where: { habitId_dateKey: { habitId, dateKey: todayKey } },
      });

      if (existing) {
        await tx.habitCompletion.delete({ where: { id: existing.id } });
        await applyAuraDelta(tx, userId, -auraForAction(existing.action));
      }
    }

    await tx.habit.update({
      where: { id: habitId },
      data: { title, days: newDays },
    });
    return "updated";
  });
  if (result === "missing") return notFound();
  if (result === "duplicate") return duplicateHabitTitle();

  revalidateHabitPages(habitId);

  const updated = await getHabitForUser(userId, habitId, timeZone);
  if (!updated) return notFound();

  return NextResponse.json(updated);
}

/* ---------------- DELETE HABIT ---------------- */

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const session = await getAppSession();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const limited = rateLimitResponse(await habitDeleteLimiter.limit(userId));
  if (limited) return limited;

  const habitId = params.id;
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { id: true },
  });

  if (!habit) return notFound();

  const deleted = await prisma.$transaction(async (tx) => {
    if (!await lockHabit(tx, habitId, userId)) return false;

    const counts = await tx.habitCompletion.groupBy({
      by: ["action"],
      where: { habitId },
      _count: { _all: true },
    });
    const countOf = (action: CompletionAction) =>
      counts.find((c) => c.action === action)?._count._all ?? 0;

    // Take back whatever aura this habit contributed.
    await applyAuraDelta(
      tx,
      userId,
      -auraForCounts(countOf("COMPLETED"), countOf("SKIPPED")),
    );

    await tx.habit.deleteMany({ where: { id: habitId, userId } });
    return true;
  });
  if (!deleted) return notFound();

  revalidateHabitPages();

  return NextResponse.json({ ok: true });
}
