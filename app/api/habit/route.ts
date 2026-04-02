import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { habitCreateLimiter } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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
    const title =
      typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const days: string[] = Array.isArray(body.days)
      ? Array.from(
          new Set(
            body.days.filter((day: unknown): day is string => typeof day === "string"),
          ),
        )
      : [];

    if (
      !title ||
      !Array.isArray(days) ||
      days.some((day) => typeof day !== "string")
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const habit = await prisma.habit.create({
      data: {
        title,
        days,
        userId: session.user.id,
      },
    });

    revalidatePath("/");

    return NextResponse.json(
      {
        id: habit.id,
        title: habit.title,
        createdAt: habit.createdAt,
        status: "NONE",
        streak: habit.currentStreak,
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
