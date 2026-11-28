import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getHabitsForUser, hasHabitTitle, lockHabitTitles } from "@/lib/habits";
import { getUserTimeZone } from "@/lib/timezone";
import { habitCreateLimiter } from "@/lib/ratelimit";
import { parseHabitInput } from "@/lib/validation";
import {
  badRequest,
  duplicateHabitTitle,
  rateLimitResponse,
  readJson,
  unauthorized,
} from "@/lib/api";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const habits = await getHabitsForUser(session.user.id, getUserTimeZone());

  return NextResponse.json({ habits });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return unauthorized();

    const limited = rateLimitResponse(
      await habitCreateLimiter.limit(session.user.id),
    );
    if (limited) return limited;

    const parsed = parseHabitInput(await readJson(req));
    if (!parsed.ok) return badRequest(parsed.error);

    const userId = session.user.id;
    const input = parsed.value;
    const habit = await prisma.$transaction(async (tx) => {
      await lockHabitTitles(tx, userId);
      if (await hasHabitTitle(tx, userId, input.title)) return null;
      return tx.habit.create({ data: { ...input, userId } });
    });
    if (!habit) return duplicateHabitTitle();

    revalidatePath("/");

    return NextResponse.json(
      {
        id: habit.id,
        title: habit.title,
        createdAt: habit.createdAt,
        status: "NONE",
        streak: 0,
        days: habit.days,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
