import Leaderboard from "../components/LeaderBoard";
import Sidebar from "../components/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
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

  const res = await fetch("http://localhost:3000/api/leaderboard", {
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
    <main className="flex h-screen bg-[#1E2330]">
      <ClientRefresh />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {currentUser && (
            <div className="stats shadow bg-neutral">
              <div className="stat">
                <div className="stat-title text-[1.2rem]">Your Rank</div>
                <div className="stat-value text-success">
                  #{currentUser.rank}
                </div>
                <div className="stat-desc text-[1.1rem]">
                  Aura Points:{" "}
                  <span className="text-[#ffbf46]">
                    {currentUser.auraPoints}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Leaderboard
            data={leaderboardData}
            currentUserId={session?.user?.id}
          />
        </div>
      </div>
    </main>
  );
}
