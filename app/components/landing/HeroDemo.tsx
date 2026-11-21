"use client";

import { useState } from "react";
import { FaBolt, FaFireAlt } from "react-icons/fa";
import { IoCheckmark, IoClose } from "react-icons/io5";

type Status = "NONE" | "DONE" | "SKIP";

const NEXT: Record<Status, Status> = { NONE: "DONE", DONE: "SKIP", SKIP: "NONE" };
const AURA: Record<Status, number> = { NONE: 0, DONE: 10, SKIP: -10 };

const INITIAL = [
  { id: "run", title: "Morning run", streak: 12, status: "DONE" as Status },
  { id: "read", title: "Read 20 pages", streak: 8, status: "NONE" as Status },
  { id: "water", title: "Drink 2L water", streak: 21, status: "NONE" as Status },
  { id: "med", title: "Meditate", streak: 3, status: "NONE" as Status },
];

const BASE_AURA = 1240;

/** A tiny working copy of the real habit list, so visitors feel the product. */
export default function HeroDemo() {
  const [habits, setHabits] = useState(INITIAL);

  const aura =
    BASE_AURA + habits.reduce((sum, h) => sum + AURA[h.status], 0);
  const done = habits.filter((h) => h.status === "DONE").length;

  const toggle = (id: string) =>
    setHabits((current) =>
      current.map((h) => (h.id === id ? { ...h, status: NEXT[h.status] } : h)),
    );

  return (
    <div className="w-full max-w-md rounded-2xl border border-ink-600 bg-ink-900 p-4 shadow-2xl shadow-black/40 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-mist-100">Today</p>
          <p className="text-xs text-mist-500">
            {done} of {habits.length} done
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold"
          aria-live="polite"
          data-testid="demo-aura"
        >
          <FaBolt className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="tabular-nums">{aura.toLocaleString("en-US")}</span>
        </div>
      </div>

      <ul className="space-y-2.5">
        {habits.map((habit) => {
          const isDone = habit.status === "DONE";
          const isSkip = habit.status === "SKIP";
          const streak = habit.streak + (isDone ? 1 : 0);

          return (
            <li
              key={habit.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-ink-800 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`truncate font-medium ${
                    isSkip
                      ? "text-red-400"
                      : isDone
                        ? "text-mist-500 line-through"
                        : "text-mist-100"
                  }`}
                >
                  {habit.title}
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                  <FaFireAlt className="h-3 w-3" aria-hidden="true" />
                  <span className="tabular-nums">{streak}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggle(habit.id)}
                aria-label={`${habit.title}: ${
                  isDone ? "completed" : isSkip ? "skipped" : "not done"
                }. Click to change`}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 transition-transform duration-150 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-done ${
                  isDone
                    ? "border-done text-done"
                    : isSkip
                      ? "border-red-400 text-red-400"
                      : "border-ink-600 text-transparent hover:border-mist-500"
                }`}
              >
                {isDone && <IoCheckmark className="h-5 w-5" aria-hidden="true" />}
                {isSkip && <IoClose className="h-5 w-5" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-center text-xs text-mist-500">
        Try it — tap a box. Done = +10 aura, skipped = −10.
      </p>
    </div>
  );
}
