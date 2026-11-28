"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { celebrateCompletion, completionOrigin } from "@/lib/completion-feedback";
import { FaBolt } from "react-icons/fa";
import { IoCheckmark, IoClose } from "react-icons/io5";

type Status = "NONE" | "DONE" | "SKIP";

const NEXT: Record<Status, Status> = { NONE: "DONE", DONE: "SKIP", SKIP: "NONE" };
const AURA: Record<Status, number> = { NONE: 0, DONE: 10, SKIP: -10 };
const BASE_AURA = 1240;
const BASE_STREAK = 46;

const INITIAL = [
  { id: "run", title: "Morning run", streak: 46, status: "DONE" as Status },
  { id: "read", title: "Read 20 pages", streak: 31, status: "NONE" as Status },
  { id: "water", title: "Drink water", streak: 12, status: "NONE" as Status },
  { id: "med", title: "Meditate", streak: 5, status: "NONE" as Status },
];

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

/* A tiny shared store so the number and the card stay in sync without
   lifting state into a server component. */
/* A tiny shared store so the number and the card stay in sync without
   lifting state into a server component. */
type HabitsState = [typeof INITIAL, Dispatch<SetStateAction<typeof INITIAL>>];
const HabitsContext = createContext<HabitsState | null>(null);

function useHabitsContext(): HabitsState {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("StreakHero parts must be inside <StreakHeroProvider>");
  return ctx;
}

export function StreakHeroProvider({ children }: { children: React.ReactNode }) {
  const state = useState(INITIAL);
  return <HabitsContext.Provider value={state}>{children}</HabitsContext.Provider>;
}

/**
 * The hero: a giant streak number that counts up and reacts to a working
 * copy of the real habit list (done +10, skipped −10, tap again to undo).
 */
export function StreakNumber() {
  const [habits] = useHabitsContext();
  const doneAny = habits.some((h) => h.status === "DONE");
  const target = BASE_STREAK + (doneAny ? 1 : 0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(target);
      return;
    }
    const id = setInterval(() => {
      setShown((n) => (n === target ? n : n < target ? n + 1 : n - 1));
    }, 28);
    return () => clearInterval(id);
  }, [target]);

  return (
    <>
      <span className="sr-only">{target} day streak</span>
      <span
        aria-hidden="true"
        className="block text-[clamp(150px,21vw,270px)] font-black leading-[0.8] tracking-[-0.07em] tabular-nums"
      >
        {shown}
      </span>
    </>
  );
}

export function HabitDemoCard() {
  const [habits, setHabits] = useHabitsContext();

  const aura =
    BASE_AURA + habits.reduce((sum, h) => sum + AURA[h.status], 0);
  const done = habits.filter((h) => h.status === "DONE").length;

  const toggle = (id: string) =>
    setHabits((current) =>
      current.map((h) => (h.id === id ? { ...h, status: NEXT[h.status] } : h)),
    );

  return (
    <div className="anim-slide w-full max-w-[440px] rounded-3xl bg-ink p-5 text-paper [animation-delay:200ms] sm:p-[22px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-base font-extrabold">Today</div>
          <div className="text-[13px] text-fog">{done} of 4 done today</div>
        </div>
        <div
          data-testid="demo-aura"
          className="flex items-center gap-1.5 text-lg font-black text-signal"
        >
          <FaBolt className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="tabular-nums">{aura.toLocaleString("en-US")}</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-1.5">
        {WEEK.map((day, i) => {
          const isToday = i === 6;
          const on = isToday ? done > 0 : true;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`h-[34px] w-full rounded-lg ${on ? "bg-signal" : "bg-ink-soft"} ${isToday ? "outline outline-2 outline-offset-2 outline-paper" : ""}`}
              />
              <div className="text-[11px] font-bold text-fog">{day}</div>
            </div>
          );
        })}
      </div>

      <ul className="flex flex-col gap-0.5">
        {habits.map((habit, index) => {
          const isDone = habit.status === "DONE";
          const isSkip = habit.status === "SKIP";
          return (
            <li
              key={habit.id}
              style={{ animationDelay: `${380 + index * 80}ms` }}
              className="anim-slide flex items-center justify-between gap-3 rounded-xl border-t border-ink-line px-2.5 py-3 transition-colors first:border-t-0 hover:bg-ink-soft"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`truncate text-[15px] font-bold ${isDone ? "text-[#7a7a80] line-through" : isSkip ? "text-[#7a7a80]" : "text-paper"}`}
                >
                  {habit.title}
                </span>
                <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-signal">
                  {habit.streak + (isDone ? 1 : 0)}d
                </span>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  toggle(habit.id);
                  if (habit.status === "NONE") {
                    celebrateCompletion(completionOrigin(event.currentTarget));
                  }
                }}
                aria-label={`${habit.title}: ${isDone ? "completed" : isSkip ? "skipped" : "not done"}. Click to change`}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] border-2 transition-transform duration-150 active:scale-90 ${
                  isDone
                    ? "border-signal bg-signal text-ink"
                    : isSkip
                      ? "border-[#6a6a70] bg-[#2a2a2d] text-paper"
                      : "border-[#3a3a3e] text-transparent hover:border-fog"
                }`}
              >
                {isDone && <IoCheckmark className="h-5 w-5" aria-hidden="true" />}
                {isSkip && <IoClose className="h-5 w-5" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-center text-xs text-[#8a8a90]">
        Tap a box: done +10, skipped −10, tap again to undo.
      </p>
    </div>
  );
}
