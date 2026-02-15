import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTodayDate, getTodayWeekdayKey } from "@/lib/date";

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

  const today = getTodayDate();
  const todayWeekday = getTodayWeekdayKey();

  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      days: { has: todayWeekday },
    },
    include: {
      completions: {
        where: { date: today },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = habits.map((habit) => {
    const completion = habit.completions[0];

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
    const body = await req.json();
    const { title, days } = body;

    if (
      !title ||
      !Array.isArray(days) ||
      days.some((day) => typeof day !== "string")
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

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
