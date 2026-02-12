import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      auraPoints: true,
    },
    orderBy: {
      auraPoints: "desc",
    },
  });

  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    id: user.id,
    name: user.name ?? "Anonymous",
    avatar: user.image ?? "/avatar.png",
    auraPoints: user.auraPoints,
  }));

  return NextResponse.json(leaderboard);
}
