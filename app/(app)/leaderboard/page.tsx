import Leaderboard from "@/app/components/LeaderBoard";
import { Prisma } from "@prisma/client";
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

type LeaderboardRowResult = {
  id: string;
  name: string | null;
  avatar: string | null;
  auraPoints: number;
  rank: bigint;
  totalCount: bigint;
};

type CurrentUserRankResult = {
  id: string;
  auraPoints: number;
  rank: bigint;
};

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  const requestedPage = Number(searchParams?.page ?? "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0
    ? Math.floor(requestedPage)
    : 1;
  const skip = (page - 1) * LEADERBOARD_LIMIT;

  const [leaderboardRows, currentUser] = await Promise.all([
    prisma.$queryRaw<LeaderboardRowResult[]>(Prisma.sql`
      WITH ranked_users AS (
        SELECT
          id,
          name,
          image AS avatar,
          "auraPoints",
          ROW_NUMBER() OVER (ORDER BY "auraPoints" DESC, id ASC) AS rank,
          COUNT(*) OVER () AS "totalCount"
        FROM "User"
      )
      SELECT
        id,
        name,
        avatar,
        "auraPoints",
        rank,
        "totalCount"
      FROM ranked_users
      WHERE rank > ${skip} AND rank <= ${skip + LEADERBOARD_LIMIT}
      ORDER BY rank ASC
    `),
    session?.user?.id
      ? prisma.$queryRaw<CurrentUserRankResult[]>(Prisma.sql`
          WITH ranked_users AS (
            SELECT
              id,
              "auraPoints",
              ROW_NUMBER() OVER (ORDER BY "auraPoints" DESC, id ASC) AS rank
            FROM "User"
          )
          SELECT id, "auraPoints", rank
          FROM ranked_users
          WHERE id = ${session.user.id}
          LIMIT 1
        `)
      : Promise.resolve([]),
  ]);

  const leaderboardData: LeaderboardUser[] = leaderboardRows.map((user) => {
    const name = user.name ?? "Anonymous";

    return {
      rank: Number(user.rank),
      id: user.id,
      name,
      auraPoints: user.auraPoints,
      avatar: user.avatar && user.avatar.trim() !== "" ? user.avatar : null,
    };
  });

  const totalUsers = leaderboardRows.length > 0
    ? Number(leaderboardRows[0].totalCount)
    : 0;
  const currentUserRank = currentUser[0] ?? null;
  const hasPreviousPage = page > 1;
  const hasNextPage = skip + leaderboardRows.length < totalUsers;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentUserRank && (
          <div className="bg-neutral rounded-xl p-4">
            <div className="text-sm opacity-60">Your Rank</div>
            <div className="text-3xl font-bold text-success">
              #{Number(currentUserRank.rank)}
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
