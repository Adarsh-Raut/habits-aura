import Leaderboard from "@/app/components/LeaderBoard";
import { getAppSession } from "@/lib/auth";
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
  const session = await getAppSession();
  const isGuest = session?.user.guestExpiresAt !== undefined;
  const requestedPage = Number(searchParams?.page ?? "1");
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;
  const skip = (page - 1) * LEADERBOARD_LIMIT;

  // Same ordering everywhere: most aura first, id as the tie-breaker.
  const [rows, totalUsers, me] = await Promise.all([
    prisma.user.findMany({
      where: { isGuest: false },
      select: { id: true, name: true, image: true, auraPoints: true },
      orderBy: [{ auraPoints: "desc" }, { id: "asc" }],
      skip,
      take: LEADERBOARD_LIMIT,
    }),
    prisma.user.count({ where: { isGuest: false } }),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, auraPoints: true },
        })
      : null,
  ]);

  // Rank = 1 + number of users ahead of me (uses the auraPoints index).
  const usersAhead = me && !isGuest
    ? await prisma.user.count({
        where: {
          isGuest: false,
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

  const hasPreviousPage = page > 1;
  const hasNextPage = skip + rows.length < totalUsers;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {me && (isGuest ? (
          <section aria-labelledby="demo-score-heading" className="rounded-2xl bg-ink p-5 text-paper">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <h2 id="demo-score-heading" className="text-sm font-bold text-fog">
                Your demo score
              </h2>
              <span className="rounded-full border border-ink-line px-2 py-1 text-xs font-bold text-paper">
                Guest demo
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-5xl font-black leading-none tracking-[-0.05em] text-signal">
                {me.auraPoints.toLocaleString("en-US")}
              </span>
              <span className="text-sm text-fog">Aura Points</span>
            </div>
          </section>
        ) : (
          <div className="rounded-2xl bg-ink p-5 text-paper">
            <div className="text-sm text-fog">Your Rank</div>
            <div className="text-6xl font-black leading-none tracking-[-0.05em] text-signal">
              #{usersAhead + 1}
            </div>
            <div className="mt-2 text-sm text-fog">
              Aura Points{" "}
              <span className="font-black text-paper">
                {me.auraPoints}
              </span>
            </div>
          </div>
        ))}

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
