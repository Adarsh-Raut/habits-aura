const Leaderboard = ({ data, currentUserId }) => {
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
            {data.map((player, index) => {
              const isYou = player.id === currentUserId;

              return (
                <tr
                  key={player.id}
                  className={isYou ? "bg-success/20 font-semibold" : ""}
                >
                  <td>{index + 1}</td>

                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img src={player.avatar} alt={player.name} />
                        </div>
                      </div>

                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {player.name}
                        {isYou && (
                          <span className="badge badge-success ml-2">You</span>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="hidden sm:table-cell">
                    {player.stats["24h"]}
                  </td>
                  <td className="hidden sm:table-cell">{player.stats["7d"]}</td>
                  <td className="hidden sm:table-cell">
                    {player.stats["30d"]}
                  </td>
                  <td className="font-medium text-[#ffbf46]">
                    {player.stats.allTime}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
