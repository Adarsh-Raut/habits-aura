import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTodayDate, getTodayKey } from "@/lib/date";

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

  const todayKey = getTodayKey();
  const todayDate = getTodayDate();

  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      days: { has: todayKey },
    },
    include: {
      completions: {
        where: { date: todayDate },
      },
    },
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
    console.log(body);
    const { title, days } = body;

    if (
      !title ||
      !Array.isArray(days) ||
      days.some((day) => typeof day !== "string")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid input. Title must be a string and days must be an array of strings.",
        },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to create a habit." },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
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
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
