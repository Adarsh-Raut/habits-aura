import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDate } from "@/lib/date";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const today = getTodayDate();

  const existing = await prisma.habitCompletion.findUnique({
    where: {
      habitId_date: {
        habitId: params.id,
        date: today,
      },
    },
  });

  if (existing) {
    await prisma.habitCompletion.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.habitCompletion.create({
      data: {
        habitId: params.id,
        date: today,
      },
    });
  }

  return NextResponse.json({ success: true });
}
