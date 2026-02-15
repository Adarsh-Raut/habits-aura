"use client";

import { useEffect, useState } from "react";
import HabitHeatmap from "./HabitHeatmap";
import { FaFireAlt, FaTrophy } from "react-icons/fa";

type Habit = {
  id: string;
  title: string;
};

type HabitStats = {
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  calendar: Record<string, number>;
};

type Props = {
  habits: Habit[];
};

export default function StatsView({ habits }: Props) {
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id ?? null);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedHabitId) return;

    setLoading(true);

    fetch(`/api/habit/${selectedHabitId}/stats`)
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [selectedHabitId]);

  return (
    <div className="space-y-6 text-gray-200">
      {/* Selector */}
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

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-56 md:col-span-2 rounded-xl" />
        </div>
      )}

      {/* Stats */}
      {stats && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Current Streak"
              value={stats.currentStreak}
              icon={<FaFireAlt className="text-orange-500" />}
              subtitle="Days in a row"
              success
            />

            <StatCard
              title="Longest Streak"
              value={stats.longestStreak}
              icon={<FaTrophy className="text-warning" />}
              subtitle="Best consistency"
            />
          </div>

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

/* --- Small reusable card --- */
function StatCard({
  title,
  value,
  icon,
  subtitle,
  success,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  success?: boolean;
}) {
  return (
    <div className="bg-neutral rounded-xl p-4">
      <div className="text-sm opacity-60">{title}</div>
      <div
        className={`text-3xl font-bold flex items-center gap-2 ${
          success ? "text-success" : ""
        }`}
      >
        {icon}
        {value}
      </div>
      <div className="text-sm opacity-60">{subtitle}</div>
    </div>
  );
}
