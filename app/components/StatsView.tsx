"use client";

import dynamic from "next/dynamic";
import EmptyState from "./EmptyState";
import { FaFireAlt, FaTrophy } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type HabitSummary = {
  id: string;
  title: string;
  currentStreak: number;
  longestStreak: number;
};

type HabitStats = {
  habitId: string;
  title: string;
  currentStreak: number;
  longestStreak: number;
  windowStart: string;
  calendar: Record<string, number>;
};

type Props = {
  habits: HabitSummary[];
  todayKey: string;
  initialStats?: HabitStats | null;
};

// The calendar library wraps every day cell in a lazily-loaded tooltip
// Suspense boundary. Server-rendering more than ~50 of them makes React's
// hydration exceed its nested-update limit ("Maximum update depth exceeded"),
// which breaks the page for any habit with a few weeks of history. Rendering
// it on the client only avoids hydrating those boundaries at all.
const HabitHeatmap = dynamic(() => import("./HabitHeatmap"), {
  ssr: false,
  loading: () => <div className="skeleton h-48 w-full rounded-lg" />,
});

export default function StatsView({ habits, todayKey, initialStats }: Props) {
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id ?? null);

  const selectedHabit = useMemo(
    () => habits.find((h) => h.id === selectedHabitId) ?? null,
    [habits, selectedHabitId],
  );

  useEffect(() => {
    if (selectedHabitId && !habits.some((h) => h.id === selectedHabitId)) {
      setSelectedHabitId(habits[0]?.id ?? null);
    }
  }, [habits, selectedHabitId]);

  const statsQuery = useQuery({
    queryKey: ["habitStats", selectedHabitId],
    queryFn: async () => {
      const res = await fetch(`/api/habits/${selectedHabitId}/stats`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to load stats");

      return (await res.json()) as HabitStats;
    },
    enabled: !!selectedHabitId,
    initialData:
      initialStats && initialStats.habitId === selectedHabitId
        ? initialStats
        : undefined,
  });

  useEffect(() => {
    if (statsQuery.isError) {
      toast.error("Failed to load habit stats.");
    }
  }, [statsQuery.isError]);

  const selectedStats = statsQuery.data ?? null;
  const isLoadingStats = statsQuery.isPending;

  if (habits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 text-ink">
      {/* Selector */}
      <div className="max-w-xl rounded-2xl border border-ash bg-white p-4">
        <label htmlFor="stats-habit" className="mb-2 block text-sm font-semibold text-graphite">
          Select Habit
        </label>

        <select
          id="stats-habit"
          className="select select-bordered w-full bg-white font-semibold"
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
              icon={<FaFireAlt className="h-7 w-7 text-signal" aria-hidden="true" />}
              subtitle="Days in a row"
              highlight
            />

            <StatCard
              title="Longest Streak"
              value={
                selectedStats?.longestStreak ?? selectedHabit.longestStreak
              }
              icon={<FaTrophy className="h-6 w-6 text-ink" aria-hidden="true" />}
              subtitle="Best consistency"
            />
          </div>

          <div className="rounded-2xl border border-ash bg-white p-4 sm:p-5">
            <h2 className="mb-1 text-lg font-black tracking-tight">Yearly Consistency</h2>
            <p className="mb-4 text-sm text-graphite">Calendar activity map</p>

            {isLoadingStats ? (
              <div className="skeleton h-48 w-full rounded-lg" />
            ) : selectedStats ? (
              <HabitHeatmap
                calendar={selectedStats.calendar}
                windowStart={selectedStats.windowStart}
                todayKey={todayKey}
              />
            ) : (
              <p className="text-sm text-graphite">No stats available yet.</p>
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
  highlight,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        highlight ? "bg-ink text-paper" : "border border-ash bg-white text-ink"
      }`}
    >
      <div className={`text-sm ${highlight ? "text-fog" : "text-graphite"}`}>
        {title}
      </div>
      <div
        className={`flex items-center gap-3 text-6xl font-black leading-none tracking-[-0.05em] tabular-nums ${
          highlight ? "text-signal" : ""
        }`}
      >
        {icon}
        {value}
      </div>
      <div className={`mt-1 text-sm ${highlight ? "text-fog" : "text-graphite"}`}>
        {subtitle}
      </div>
    </div>
  );
}
