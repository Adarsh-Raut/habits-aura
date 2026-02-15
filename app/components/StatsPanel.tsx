"use client";

import { useEffect, useState } from "react";

type Stats = {
  currentStreak: number;
  longestStreak: number;
  calendar: Record<string, number>;
};

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXTAUTH_URL}/api/stats`)
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-neutral rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-bold">Stats</h3>

      <div className="stats stats-vertical bg-base-200">
        <div className="stat">
          <div className="stat-title">Current Streak</div>
          <div className="stat-value text-success">
            🔥 {stats.currentStreak}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Longest Streak</div>
          <div className="stat-value">🏆 {stats.longestStreak}</div>
        </div>
      </div>

      <div>
        <p className="text-sm mb-2">Habit activity</p>
        <div className="grid grid-cols-7 gap-1">
          {Object.entries(stats.calendar).map(([date, count]) => (
            <div
              key={date}
              title={`${date}: ${count} habits`}
              className={`w-3 h-3 rounded ${
                count >= 3
                  ? "bg-green-600"
                  : count === 2
                    ? "bg-green-500"
                    : "bg-green-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
