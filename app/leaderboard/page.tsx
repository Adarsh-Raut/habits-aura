import Leaderboard from "../components/LeaderBoard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

type LeaderboardUser = {
  id: string;
  name: string;
  avatar: string;
  auraPoints: number;
  rank: number;
};

export default async function Page() {
  const session = await getServerSession(authOptions);

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

  const leaderboardData: LeaderboardUser[] = users.map((user, index) => {
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

  const currentUser = session
    ? leaderboardData.find((u) => u.id === session.user.id)
    : null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentUser && (
          <div className="bg-neutral rounded-xl p-4">
            <div className="text-sm opacity-60">Your Rank</div>
            <div className="text-3xl font-bold text-success">
              #{currentUser.rank}
            </div>
            <div className="text-sm mt-1">
              Aura Points{" "}
              <span className="text-[#ffbf46] font-semibold">
                {currentUser.auraPoints}
              </span>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <Leaderboard
            data={leaderboardData}
            currentUserId={session?.user?.id}
          />
        </div>
      </div>
    </>
  );
}
