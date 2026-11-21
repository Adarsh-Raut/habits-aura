import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHabitsForUser } from "@/lib/habits";
import { getUserTimeZone } from "@/lib/timezone";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habits = await getHabitsForUser(session.user.id, getUserTimeZone());

  return NextResponse.json({ habits });
}