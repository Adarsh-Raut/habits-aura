import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isCompleted } = body;

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "Invalid input. isCompleted must be a boolean." },
        { status: 400 }
      );
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: { isCompleted },
    });
    revalidatePath("/");
    return NextResponse.json(updatedHabit, { status: 200 });
  } catch (error) {
    console.error("Error updating habit:", error);

    if (error instanceof Error && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Habit not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}
