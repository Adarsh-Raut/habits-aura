"use client";

import HabitHeatmap from "./HabitHeatmap";
import EmptyState from "./EmptyState";
import { FaFireAlt, FaTrophy } from "react-icons/fa";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type HabitSummary = {
  id: string;
  title: string;
  currentStreak: number;
  longestStreak: number;
};

type HabitStats = HabitSummary & {
  windowStart: string;
  calendar: Record<string, number>;
};

type Props = {
  habits: HabitSummary[];
  todayKey: string;
};

export default function StatsView({ habits, todayKey }: Props) {
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id ?? null);
  const [selectedStats, setSelectedStats] = useState<HabitStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const statsCacheRef = useRef<Record<string, HabitStats>>({});

  const selectedHabit = useMemo(
    () => habits.find((h) => h.id === selectedHabitId) ?? null,
    [habits, selectedHabitId],
  );

  useEffect(() => {
    if (selectedHabitId && !habits.some((h) => h.id === selectedHabitId)) {
      setSelectedHabitId(habits[0]?.id ?? null);
    }
  }, [habits, selectedHabitId]);

  useEffect(() => {
    if (!selectedHabitId) {
      setSelectedStats(null);
      return;
    }

    const cachedStats = statsCacheRef.current[selectedHabitId];
    if (cachedStats) {
      setSelectedStats(cachedStats);
      setIsLoadingStats(false);
      return;
    }

    const controller = new AbortController();

    async function loadStats() {
      setIsLoadingStats(true);

      try {
        const res = await fetch(`/api/habit/${selectedHabitId}/stats`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load stats");
        }

        const data = (await res.json()) as HabitStats;
        statsCacheRef.current[selectedHabitId] = data;
        setSelectedStats(data);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setSelectedStats(null);
        toast.error("Failed to load habit stats.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingStats(false);
        }
      }
    }

    loadStats();

    return () => controller.abort();
  }, [selectedHabitId]);

  if (habits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 text-gray-200">
      {/* Selector */}
      <div className="bg-neutral rounded-xl p-4 max-w-xl">
        <label className="block text-sm mb-2 opacity-60">Select Habit</label>

        <select
          className="bg-[#242933] select select-bordered w-full"
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

      {/* Stats */}
      {selectedHabit && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Current Streak"
              value={
                selectedStats?.currentStreak ?? selectedHabit.currentStreak
              }
              icon={<FaFireAlt className="text-orange-500" />}
              subtitle="Days in a row"
              success
            />

            <StatCard
              title="Longest Streak"
              value={
                selectedStats?.longestStreak ?? selectedHabit.longestStreak
              }
              icon={<FaTrophy className="text-warning" />}
              subtitle="Best consistency"
            />
          </div>

          <div className="bg-neutral rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-1">Yearly Consistency</h2>
            <p className="text-sm opacity-60 mb-4">Calendar activity map</p>

            {isLoadingStats ? (
              <div className="skeleton h-48 w-full rounded-lg" />
            ) : selectedStats ? (
              <HabitHeatmap
                calendar={selectedStats.calendar}
                windowStart={selectedStats.windowStart}
                todayKey={todayKey}
              />
            ) : (
              <p className="text-sm text-gray-400">No stats available yet.</p>
            )}
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
