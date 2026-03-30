import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTodayDateKey, getTodayWeekdayKey } from "@/lib/date";
import { habitCreateLimiter } from "@/lib/ratelimit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const todayKey = getTodayDateKey();
  const todayWeekday = getTodayWeekdayKey();

  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      days: { has: todayWeekday },
    },
    include: {
      completions: {
        select: { action: true, dateKey: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = habits.map((habit) => {
    const completion = habit.completions.find((c) => c.dateKey === todayKey);

    return {
      id: habit.id,
      title: habit.title,
      status: completion?.action ?? "NONE",
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success, remaining, reset } = await habitCreateLimiter.limit(
      session.user.id,
    );

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

    const body = await req.json();
    const { title, days } = body;

    if (
      !title ||
      !Array.isArray(days) ||
      days.some((day) => typeof day !== "string")
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const habit = await prisma.habit.create({
      data: {
        title,
        days,
        userId: user.id,
      },
    });

    revalidatePath("/");

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("POST /api/habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
