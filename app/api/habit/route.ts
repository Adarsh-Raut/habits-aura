import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Update to your auth configuration path
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    // Fetch all habits from the database
    const habits = await prisma.habit.findMany({
      select: {
        id: true,
        title: true,
        isCompleted: true,
        days: true,
      },
    });

    return NextResponse.json(habits, { status: 200 });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();
    console.log(body);
    const { title, days } = body;

    // Validate input
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
        { status: 400 }
      );
    }

    // Get the currently logged-in user's session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to create a habit." },
        { status: 401 }
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Create the habit in the database
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
      { status: 500 }
    );
  }
}
