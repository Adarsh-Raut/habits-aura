import Leaderboard from "@/app/components/LeaderBoard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

const LEADERBOARD_LIMIT = 50;

type LeaderboardUser = {
  id: string;
  name: string;
  avatar: string | null;
  auraPoints: number;
  rank: number;
};

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  const requestedPage = Number(searchParams?.page ?? "1");
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;
  const skip = (page - 1) * LEADERBOARD_LIMIT;

  // Same ordering everywhere: most aura first, id as the tie-breaker.
  const [rows, totalUsers, me] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, image: true, auraPoints: true },
      orderBy: [{ auraPoints: "desc" }, { id: "asc" }],
      skip,
      take: LEADERBOARD_LIMIT,
    }),
    prisma.user.count(),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, auraPoints: true },
        })
      : null,
  ]);

  // Rank = 1 + number of users ahead of me (uses the auraPoints index).
  const usersAhead = me
    ? await prisma.user.count({
        where: {
          OR: [
            { auraPoints: { gt: me.auraPoints } },
            { auraPoints: me.auraPoints, id: { lt: me.id } },
          ],
        },
      })
    : 0;

  const leaderboardData: LeaderboardUser[] = rows.map((user, index) => ({
    rank: skip + index + 1,
    id: user.id,
    name: user.name ?? "Anonymous",
    auraPoints: user.auraPoints,
    avatar: user.image && user.image.trim() !== "" ? user.image : null,
  }));

  const currentUserRank = me
    ? { rank: usersAhead + 1, auraPoints: me.auraPoints }
    : null;
  const hasPreviousPage = page > 1;
  const hasNextPage = skip + rows.length < totalUsers;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentUserRank && (
          <div className="bg-neutral rounded-xl p-4">
            <div className="text-sm opacity-60">Your Rank</div>
            <div className="text-3xl font-bold text-success">
              #{currentUserRank.rank}
            </div>
            <div className="text-sm mt-1">
              Aura Points{" "}
              <span className="text-[#ffbf46] font-semibold">
                {currentUserRank.auraPoints}
              </span>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <Leaderboard
            data={leaderboardData}
            currentUserId={session?.user?.id}
            page={page}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
          />
        </div>
      </div>
    </>
  );
}
