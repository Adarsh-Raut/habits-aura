"use client";

import { useEffect, useState } from "react";
import HabitHeatmap from "./HabitHeatmap";
import { FaFireAlt, FaTrophy } from "react-icons/fa";
import { stat } from "fs";

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
        if (data.length > 0) {
          setSelectedHabitId(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedHabitId) return;

    fetch(`/api/habit/${selectedHabitId}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      });
  }, [selectedHabitId]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-gray-200">
      {/* PAGE HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Habit Stats</h1>
        <p className="text-gray-400">
          Track streaks and consistency for each habit
        </p>
      </div>

      {/* HABIT SELECTOR CARD */}
      <div className="bg-neutral rounded-xl p-6 w-full max-w-md">
        <label className="block text-sm mb-2 text-gray-400">Select Habit</label>
        <select
          className="select select-bordered w-full"
          value={selectedHabitId ?? ""}
          onChange={(e) => setSelectedHabitId(e.target.value)}
        >
          <option value="" disabled>
            Choose a habit
          </option>
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.title}
            </option>
          ))}
        </select>
      </div>

      {/* STATS + HEATMAP */}
      {stats && (
        <div className="space-y-10">
          {/* STREAK CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="stats shadow bg-neutral">
              <div className="stat">
                <div className="stat-title text-sm uppercase tracking-wide">
                  Current Streak
                </div>

                <div className="stat-value text-success flex items-center gap-2">
                  <FaFireAlt className="text-orange-600" />
                  {stats.currentStreak}
                </div>

                <div className="stat-desc text-sm">Days in a row</div>
              </div>
            </div>

            <div className="stats shadow bg-neutral">
              <div className="stat">
                <div className="stat-title text-sm uppercase tracking-wide">
                  Longest Streak
                </div>

                <div className="stat-value flex items-center gap-2">
                  <FaTrophy className="text-warning" />
                  {stats.longestStreak}
                </div>

                <div className="stat-desc text-sm">Best consistency</div>
              </div>
            </div>
          </div>

          {/* HEATMAP CARD */}
          <div className="bg-neutral rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Yearly Consistency</h2>
              <p className="text-sm text-gray-400">Calendar activity map</p>
            </div>

            <HabitHeatmap
              calendar={stats.calendar}
              createdAt={stats.createdAt}
            />
          </div>
        </div>
      )}
    </div>
  );
}
