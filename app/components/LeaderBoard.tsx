import Link from "next/link";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Avatar from "./Avatar";

type LeaderboardPlayer = {
  id: string;
  name: string;
  avatar: string | null;
  rank: number;
  auraPoints: number;
};

type LeaderboardProps = {
  data: LeaderboardPlayer[];
  currentUserId?: string;
  page: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const rankMedals: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

function LeaderboardRow({
  player,
  isYou,
}: {
  player: LeaderboardPlayer;
  isYou: boolean;
}) {
  const rankDisplay = rankMedals[player.rank] ?? player.rank;

  return (
    <tr className={isYou ? "bg-success/20 font-semibold" : ""}>
      <td className="text-lg">{rankDisplay}</td>

      <td>
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={player.avatar} name={player.name} size={32} />

          <div className="truncate">
            <span className="font-medium">{player.name}</span>
            {isYou && <span className="badge badge-success ml-2">You</span>}
          </div>
        </div>
      </td>

      <td className="font-medium text-[#ffbf46]">{player.auraPoints}</td>
    </tr>
  );
}

const Leaderboard = ({
  data,
  currentUserId,
  page,
  hasPreviousPage,
  hasNextPage,
}: LeaderboardProps) => {
  return (
    <div className="bg-neutral rounded-xl shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-2xl font-semibold mb-4">Leaderboard</h2>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm opacity-60">50 users per page</p>

        <div className="flex items-center gap-2">
          <Link
            href={
              hasPreviousPage ? `/leaderboard?page=${page - 1}` : "/leaderboard"
            }
            aria-disabled={!hasPreviousPage}
            className={`btn btn-sm gap-2 ${
              hasPreviousPage
                ? "btn-ghost"
                : "btn-ghost pointer-events-none opacity-40"
            }`}
          >
            <IoChevronBack className="h-4 w-4" />
            Prev
          </Link>

          <span className="text-sm opacity-70 min-w-16 text-center">
            Page {page}
          </span>

          <Link
            href={`/leaderboard?page=${page + 1}`}
            aria-disabled={!hasNextPage}
            className={`btn btn-sm gap-2 ${
              hasNextPage
                ? "btn-ghost"
                : "btn-ghost pointer-events-none opacity-40"
            }`}
          >
            Next
            <IoChevronForward className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="text-xs sm:text-sm">
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Aura Points</th>
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
