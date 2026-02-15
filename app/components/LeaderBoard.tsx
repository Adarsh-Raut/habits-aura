"use client";

import Avatar from "./Avatar";
import { memo } from "react";

type LeaderboardStats = {
  "24h": number;
  "7d": number;
  "30d": number;
  allTime: number;
};

type LeaderboardPlayer = {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  stats: LeaderboardStats;
};

type LeaderboardProps = {
  data: LeaderboardPlayer[];
  currentUserId?: string;
};

const LeaderboardRow = memo(
  ({ player, isYou }: { player: LeaderboardPlayer; isYou: boolean }) => {
    return (
      <tr className={isYou ? "bg-success/20 font-semibold" : ""}>
        <td>{player.rank}</td>

        <td>
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={player.avatar} name={player.name} size={32} />

            <div className="truncate">
              <span className="font-medium">{player.name}</span>
              {isYou && <span className="badge badge-success ml-2">You</span>}
            </div>
          </div>
        </td>

        <td className="hidden sm:table-cell">{player.stats["24h"]}</td>
        <td className="hidden sm:table-cell">{player.stats["7d"]}</td>
        <td className="hidden sm:table-cell">{player.stats["30d"]}</td>
        <td className="font-medium text-[#ffbf46]">{player.stats.allTime}</td>
      </tr>
    );
  },
);

LeaderboardRow.displayName = "LeaderboardRow";

const Leaderboard = ({ data, currentUserId }: LeaderboardProps) => {
  return (
    <div className="bg-neutral rounded-xl shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-2xl font-semibold mb-4">Leaderboard</h2>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="text-xs sm:text-sm">
            <tr>
              <th>#</th>
              <th>Player</th>
              <th className="hidden sm:table-cell">24h</th>
              <th className="hidden sm:table-cell">7d</th>
              <th className="hidden sm:table-cell">30d</th>
              <th>All Time</th>
            </tr>
          </thead>

          <tbody>
            {data.map((player) => (
              <LeaderboardRow
                key={player.id}
                player={player}
                isYou={player.id === currentUserId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
