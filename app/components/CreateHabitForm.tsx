"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import Link from "next/link";
import { playCompleteSound, preloadCompleteSound } from "@/lib/audio";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useHabitsStore } from "./HabitsStoreProvider";
import type { Habit } from "@/app/types/habit";

const DAY_MAP = {
  SUN: "S",
  MON: "M",
  TUE: "T",
  WED: "W",
  THU: "T",
  FRI: "F",
  SAT: "S",
} as const;

const HABIT_SUGGESTIONS = [
  "💪 Workout",
  "📚 Read",
  "🧘 Meditate",
  "🚶 Walk",
  "💧 Drink Water",
  "🚭 Stop smoking",
  "🚫 No alcohol",
  "🇺🇸 Learn English",
  "🇪🇸 Learn Spanish",
];

const EMPTY_DAYS: string[] = [];
const DEFAULT_DAYS = Object.keys(DAY_MAP);

type CreateHabitFormProps = {
  habitId?: string;
  initialTitle?: string;
  initialDays?: string[];
};

export default function CreateHabitForm({
  habitId,
  initialTitle = "",
  initialDays,
}: CreateHabitFormProps) {
  const router = useRouter();
  const { upsertHabit } = useHabitsStore();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const isEditing = !!habitId;
  const resolvedInitialDays = initialDays ?? EMPTY_DAYS;
  const normalizedInitialDays = useMemo(
    () =>
      resolvedInitialDays.length > 0 ? [...resolvedInitialDays] : [...DEFAULT_DAYS],
    [resolvedInitialDays],
  );

  const [title, setTitle] = useState(initialTitle);
  const [days, setDays] = useState<string[]>(normalizedInitialDays);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setDays(normalizedInitialDays);
    setLoading(false);
  }, [habitId, initialTitle, normalizedInitialDays]);

  useEffect(() => {
    preloadCompleteSound();
  }, []);

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || days.length === 0 || loading) return;

    setLoading(true);

    try {
      if (isEditing) {
        const res = await fetch(`/api/habit/${habitId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), days }),
        });

        if (!res.ok) throw new Error();

        const updatedHabit = ((await res.json()) as Habit & {
          createdAt: string;
        });
        upsertHabit({
          ...updatedHabit,
          createdAt: new Date(updatedHabit.createdAt),
        });

        toast.success("Habit updated!");
      } else {
        const res = await fetch("/api/habit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), days }),
        });

        if (!res.ok) throw new Error();

        const createdHabit = ((await res.json()) as Habit & {
          createdAt: string;
        });
        upsertHabit({
          ...createdHabit,
          createdAt: new Date(createdHabit.createdAt),
        });

        playCompleteSound();

        if (submitButtonRef.current) {
          const rect = submitButtonRef.current.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          const confetti = (await import("canvas-confetti")).default;
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { x, y },
          });
        }

        toast.success("Habit created!");
      }

      router.replace("/");
    } catch {
      toast.error(
        isEditing ? "Failed to update habit" : "Failed to create habit",
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="min-h-screen px-3 py-6 sm:p-6">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className={`btn btn-ghost gap-2 mb-4 ${
            loading && "pointer-events-none opacity-50"
          }`}
        >
          <FaArrowLeft />
          Back
        </Link>

        <div
          className={`card bg-neutral shadow-xl p-5 sm:p-6 space-y-6 transition ${
            loading ? "opacity-70" : ""
          }`}
        >
          <div>
            <label className="text-base sm:text-lg font-medium mb-2 block">
              {isEditing ? "Edit habit" : "My new habit"}
            </label>

            <input
              autoFocus
              disabled={loading}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Type your habit"
              className="input input-bordered w-full"
            />
          </div>

          {!isEditing && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Quick suggestions</p>
              <div className="flex flex-wrap gap-2">
                {HABIT_SUGGESTIONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    disabled={loading}
                    onClick={() => setTitle(h)}
                    className="badge badge-base-200 badge-lg cursor-pointer"
                    aria-label="Suggestion"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm sm:text-base font-medium mb-3 block">
              Days
            </label>

            <div className="grid grid-cols-7 gap-2 text-center">
              {Object.entries(DAY_MAP).map(([day, label]) => (
                <label key={day} className="flex flex-col items-center gap-1">
                  <input
                    type="checkbox"
                    checked={days.includes(day)}
                    disabled={loading}
                    onChange={() => toggleDay(day)}
                    className="checkbox checkbox-sm sm:checkbox-md"
                  />
                  <span className="text-xs sm:text-sm text-gray-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            ref={submitButtonRef}
            type="submit"
            disabled={loading}
            className="btn bg-[#05C26A] text-white btn-block"
            aria-label={isEditing ? "Save Changes" : "Create Habit"}
          >
            {loading
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Habit"}
          </button>
        </div>
      </div>
    </form>
  );
}
