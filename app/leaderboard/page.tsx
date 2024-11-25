import React from "react";
import Leaderboard from "../components/LeaderBoard";
import Sidebar from "../components/Sidebar";

type Props = {};

const page = (props: Props) => {
  return (
    <main className="flex h-screen bg-[#1E2330]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <Leaderboard
            data={[
              {
                name: "Gabe",
                avatar: "https://example.com/gabe.jpg",
                stats: {
                  "24h": 15013,
                  "7d": 12099,
                  "30d": 10925,
                  allTime: 8994,
                },
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
};

export default page;
