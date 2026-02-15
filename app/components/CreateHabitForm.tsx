"use client";

import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

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

export default function CreateHabitForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [days, setDays] = useState<string[]>(Object.keys(DAY_MAP));
  const [loading, setLoading] = useState(false);

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
      const res = await fetch("/api/habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), days }),
      });

      if (!res.ok) throw new Error();

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });

      router.replace("/");
      router.refresh();
    } catch {
      alert("Failed to create habit");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="min-h-screen px-3 py-6 sm:p-6">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className={`btn btn-ghost gap-2 mb-4 ${loading && "pointer-events-none opacity-50"}`}
        >
          <FaArrowLeft />
          Back
        </Link>

        <div
          className={`card bg-neutral shadow-xl p-5 sm:p-6 space-y-6 transition ${
            loading ? "opacity-70" : ""
          }`}
        >
          {/* TITLE */}
          <div>
            <label className="text-base sm:text-lg font-medium mb-2 block">
              My new habit
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

          {/* SUGGESTIONS */}
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
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* DAYS */}
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

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="btn bg-[#05C26A] text-white btn-block"
          >
            {loading ? "Creating..." : "Create Habit"}
          </button>
        </div>
      </div>
    </form>
  );
}
