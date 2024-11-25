import React from "react";

const Leaderboard = ({ data }) => {
  return (
    <div className="bg-neutral shadow-xl p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="table table-compact w-full">
          <thead>
            <tr>
              <th></th>
              <th>Player</th>
              <th>24h</th>
              <th>7d</th>
              <th>30d</th>
              <th>All Time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((player, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>
                  <div className="flex items-center space-x-2">
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img src={player.avatar} alt={player.name} />
                      </div>
                    </div>
                    <span>{player.name}</span>
                  </div>
                </td>
                <td>{player.stats["24h"]}</td>
                <td>{player.stats["7d"]}</td>
                <td>{player.stats["30d"]}</td>
                <td>{player.stats["allTime"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
