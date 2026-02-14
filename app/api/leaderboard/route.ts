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

  const leaderboard = users.map((user, index) => {
    const name = user.name ?? "Anonymous";

    return {
      rank: index + 1,
      id: user.id,
      name,
      auraPoints: user.auraPoints,

      avatar:
        user.image && user.image.trim() !== ""
          ? user.image
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name,
            )}&background=1f2937&color=fff`,
    };
  });

  return NextResponse.json(leaderboard);
}
