import Leaderboard from "../components/LeaderBoard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientRefresh from "./ClientRefresh";
import { headers } from "next/headers";

type LeaderboardApiUser = {
  id: string;
  name: string;
  avatar: string;
  auraPoints: number;
  rank: number;
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  const headersList = headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/leaderboard`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load leaderboard");
  }

  const users: LeaderboardApiUser[] = await res.json();

  const currentUser = session
    ? users.find((u) => u.id === session.user.id)
    : null;

  const leaderboardData = users.map((u) => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    rank: u.rank,
    stats: {
      "24h": u.auraPoints,
      "7d": u.auraPoints,
      "30d": u.auraPoints,
      allTime: u.auraPoints,
    },
  }));

  return (
    <>
      <ClientRefresh />

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
