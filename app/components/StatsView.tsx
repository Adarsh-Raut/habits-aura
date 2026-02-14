"use client";

import { useEffect, useState } from "react";
import HabitHeatmap from "./HabitHeatmap";
import { FaFireAlt, FaTrophy } from "react-icons/fa";

type Habit = {
  id: string;
  title: string;
};

type HabitStats = {
  title: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  calendar: Record<string, number>;
};

export default function StatsView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);

  useEffect(() => {
    fetch("/api/habit")
      .then((res) => res.json())
      .then((data) => {
        setHabits(data);
        if (data.length > 0) setSelectedHabitId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedHabitId) return;

    fetch(`/api/habit/${selectedHabitId}/stats`)
      .then((res) => res.json())
      .then(setStats);
  }, [selectedHabitId]);

  return (
    <div className="space-y-6 text-gray-200">
      {/* ================= SELECT HABIT ================= */}
      <div className="bg-neutral rounded-xl p-4 max-w-xl">
        <label className="block text-sm mb-2 opacity-60">Select Habit</label>
        <select
          className="select select-bordered w-full"
          value={selectedHabitId ?? ""}
          onChange={(e) => setSelectedHabitId(e.target.value)}
        >
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.title}
            </option>
          ))}
        </select>
      </div>

      {stats && (
        <>
          {/* ================= STREAKS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Streak */}
            <div className="bg-neutral rounded-xl p-4">
              <div className="text-sm opacity-60">Current Streak</div>
              <div className="text-3xl font-bold text-success flex items-center gap-2">
                <FaFireAlt className="text-orange-500" />
                {stats.currentStreak}
              </div>
              <div className="text-sm opacity-60">Days in a row</div>
            </div>

            {/* Longest Streak */}
            <div className="bg-neutral rounded-xl p-4">
              <div className="text-sm opacity-60">Longest Streak</div>
              <div className="text-3xl font-bold flex items-center gap-2">
                <FaTrophy className="text-warning" />
                {stats.longestStreak}
              </div>
              <div className="text-sm opacity-60">Best consistency</div>
            </div>
          </div>

          {/* ================= HEATMAP ================= */}
          <div className="bg-neutral rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-1">Yearly Consistency</h2>
            <p className="text-sm opacity-60 mb-4">Calendar activity map</p>

            <HabitHeatmap
              calendar={stats.calendar}
              createdAt={stats.createdAt}
            />
          </div>
        </>
      )}
    </div>
  );
}
