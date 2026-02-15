import Leaderboard from "../components/LeaderBoard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientRefresh from "./ClientRefresh";

type LeaderboardApiUser = {
  id: string;
  name: string;
  avatar: string;
  auraPoints: number;
  rank: number;
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  const res = await fetch("/api/leaderboard", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load leaderboard");
  }

  const users: LeaderboardApiUser[] = await res.json();
  const currentUser = users.find((u) => u.id === session?.user?.id);

  const leaderboardData = users.map((user) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    stats: {
      "24h": user.auraPoints,
      "7d": user.auraPoints,
      "30d": user.auraPoints,
      allTime: user.auraPoints,
    },
  }));

  return (
    <>
      <ClientRefresh />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {currentUser && (
          <div className="bg-neutral rounded-xl p-4">
            <div className="text-[1.2rem] opacity-60">Your Rank</div>
            <div className="text-3xl font-bold text-success mt-1">
              #{currentUser.rank}
            </div>
            <div className="text-[1.1rem] mt-1">
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
