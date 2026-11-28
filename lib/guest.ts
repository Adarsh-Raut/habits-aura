import type { Prisma } from "@prisma/client";
import { expectedAura, type CompletionAction } from "@/lib/aura";
import {
  addDaysToKey,
  dateKeyInTimeZone,
  dateKeyToDate,
  DAY_KEYS,
  getTodayDateKey,
  weekdayKeyOfDateKey,
} from "@/lib/date";
import { HABIT_TEMPLATES, getRandomCompletion } from "@/lib/demo-history";
import { lockHabitTitles } from "@/lib/habits";
import { prisma } from "@/lib/prisma";

const HOUR = 60 * 60 * 1000;
const GUEST_LIFETIME = 24 * HOUR;
const HOURLY_GUEST_LIMIT = 120;
// Start habits at different times so the workspace feels built up over time.
type DemoHabit = (typeof HABIT_TEMPLATES)[number] & {
  historyDays: number;
  streakDays: number;
};

const DEMO_HABITS: DemoHabit[] = [
  { ...HABIT_TEMPLATES[0], historyDays: 45, streakDays: 7 },
  { ...HABIT_TEMPLATES[1], historyDays: 90, streakDays: 10 },
  { ...HABIT_TEMPLATES[2], historyDays: 62, streakDays: 0 },
  { ...HABIT_TEMPLATES[3], historyDays: 30, streakDays: 0 },
  { ...HABIT_TEMPLATES[4], historyDays: 42, streakDays: 0 },
  { ...HABIT_TEMPLATES[5], historyDays: 21, streakDays: 5 },
  { title: "Stretch Before Work", days: HABIT_TEMPLATES[0].days, completionRate: 0.55, historyDays: 14, streakDays: 0 },
  { title: "Write in a Journal", days: DAY_KEYS, completionRate: 0.55, historyDays: 12, streakDays: 0 },
  { title: "Prep Lunches", days: ["SUN"], completionRate: 0.65, historyDays: 45, streakDays: 0 },
  { title: "Plan the Week", days: ["MON"], completionRate: 0.65, historyDays: 30, streakDays: 0 },
];

export const GUEST_BUSY = "GuestDemoBusy";

function demoData(timeZone: string, now: Date) {
  const today = getTodayDateKey(timeZone, now);
  let completed = 0;
  let skipped = 0;
  const habits = DEMO_HABITS.map(({ title, days, completionRate, historyDays, streakDays }) => {
    const firstDay = addDaysToKey(today, -historyDays);
    const createdAt = dateKeyToDate(addDaysToKey(firstDay, -1));
    while (dateKeyInTimeZone(createdAt, timeZone) < firstDay) {
      createdAt.setUTCHours(createdAt.getUTCHours() + 1);
    }

    const history: { dateKey: string; action: CompletionAction }[] = [];
    for (let offset = historyDays; offset > 0; offset--) {
      const dateKey = addDaysToKey(today, -offset);
      if (!days.includes(weekdayKeyOfDateKey(dateKey))) continue;

      const action = offset <= streakDays || offset === historyDays
        ? "COMPLETED"
        : getRandomCompletion(completionRate);
      if (!action) continue;
      if (action === "COMPLETED") completed++;
      else skipped++;
      history.push({ dateKey, action });
    }
    return { title, days, createdAt, completions: { createMany: { data: history } } };
  });
  return { auraPoints: expectedAura(completed, skipped), habits: { create: habits } };
}

export async function createGuest(timeZone: string) {
  return prisma.$transaction(async (tx) => {
    // Keep the site-wide cap exact when requests land on different instances.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended('guest-demo-creation', 0))`;
    const now = new Date();
    const guestExpiresAt = new Date(now.getTime() + GUEST_LIFETIME);
    const recent = await tx.user.count({
      where: { isGuest: true, guestExpiresAt: { gt: new Date(guestExpiresAt.getTime() - HOUR) } },
    });
    if (recent >= HOURLY_GUEST_LIMIT) throw new Error(GUEST_BUSY);

    await removeExpiredGuests(tx, now);
    return tx.user.create({
      data: { name: "Guest", isGuest: true, guestExpiresAt, ...demoData(timeZone, now) },
    });
  });
}

async function removeExpiredGuests(tx: Prisma.TransactionClient, now: Date) {
  const expired = await tx.user.findMany({
    where: { isGuest: true, guestExpiresAt: { lte: now } },
    orderBy: { guestExpiresAt: "asc" },
    take: 100,
    select: { id: true },
  });
  if (expired.length > 0) {
    await tx.user.deleteMany({ where: { id: { in: expired.map(({ id }) => id) } } });
  }
}

export async function resetGuest(userId: string, timeZone: string) {
  return prisma.$transaction(async (tx) => {
    await lockHabitTitles(tx, userId);
    const now = new Date();
    const guest = await tx.user.findFirst({
      where: { id: userId, isGuest: true, guestExpiresAt: { gt: now } },
      select: { id: true },
    });
    if (!guest) return false;

    await tx.habit.deleteMany({ where: { userId } });
    await tx.user.update({ where: { id: userId }, data: demoData(timeZone, now) });
    return true;
  });
}
