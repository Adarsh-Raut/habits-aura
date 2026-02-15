import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDate, getTodayDateKey } from "@/lib/date";
import { AURA_DELTA } from "@/lib/aura";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

    // 1️⃣ NONE -> COMPLETED
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

      return;
    }

    // 2️⃣ COMPLETED -> SKIPPED
    if (existing.action === "COMPLETED") {
      await tx.habitCompletion.update({
        where: { id: existing.id },
        data: { action: "SKIPPED" },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { auraPoints: { decrement: AURA_DELTA * 2 } },
      });

      return;
    }

    // 3️⃣ SKIPPED -> NONE (delete)
    await tx.habitCompletion.delete({
      where: { id: existing.id },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: { auraPoints: { increment: AURA_DELTA } },
    });
  });

  // 🔄 Revalidate affected pages
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
