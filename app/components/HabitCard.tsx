"use client";

import { memo } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaFireAlt } from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";
import type { Habit } from "@/app/types/habit";
import { getNextHabitDayFromWeekday } from "@/lib/date";

type HabitCardProps = {
  habit: Habit;
  todayWeekdayKey: string;
  onToggleHabit: (habit: Habit) => void;
  onOpenMenu: (
    habit: Habit,
    trigger: HTMLButtonElement,
  ) => void;
};

const HabitCard = memo(function HabitCard({
  habit,
  todayWeekdayKey,
  onToggleHabit,
  onOpenMenu,
}: HabitCardProps) {
  const isCompleted = habit.status === "COMPLETED";
  const isSkipped = habit.status === "SKIPPED";
  const isHabitDay = habit.days.includes(todayWeekdayKey);
  const nextHabitDay = getNextHabitDayFromWeekday(habit.days, todayWeekdayKey);

  return (
    <div className={`rounded-2xl border p-4 flex items-center justify-between transition-all duration-300 ${!isHabitDay ? "border-dashed border-ash bg-base-200" : "border-ash bg-white"}`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={(event) =>
            onOpenMenu(habit, event.currentTarget)
          }
          className="btn btn-ghost btn-circle min-h-11 min-w-11"
          aria-label="More Options"
          data-habit-menu-trigger={habit.id}
        >
          <BsThreeDotsVertical className="h-5 w-5 text-graphite" />
        </button>

        <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`relative truncate font-semibold text-base sm:text-lg ${
              isSkipped || isCompleted || !isHabitDay ? "text-graphite" : "text-ink"
            } transition-colors duration-300`}
          >
            <span
              className={`block truncate transition-transform duration-300 ${
                isCompleted ? "scale-[0.98]" : "scale-100"
              }`}
            >
              {habit.title}
            </span>

            <span
              className={`absolute left-0 top-1/2 h-[2px] w-full origin-left bg-current transition-transform duration-300 ${
                isCompleted ? "scale-x-100" : "scale-x-0"
              }`}
              aria-hidden="true"
            />
          </span>

          {habit.streak > 0 ? (
            <span className="flex items-center gap-1 text-xs bg-signal/15 font-bold text-signal-text px-2 py-0.5 rounded-full shrink-0">
              <FaFireAlt className="w-3 h-3" />
              {habit.streak}
            </span>
          ) : (
            <span className="text-xs text-graphite/50 flex items-center gap-1 shrink-0">
              <IoRocketOutline className="w-3 h-3" />
            </span>
          )}
          {!isHabitDay && nextHabitDay && (
            <span className="hidden sm:inline text-sm text-graphite ml-2 shrink-0 font-medium">
              Next: {nextHabitDay}
            </span>
          )}
        </div>
        {!isHabitDay && nextHabitDay && (
          <span className="sm:hidden text-xs text-graphite font-medium">
            Next: {nextHabitDay}
          </span>
        )}
        </div>
      </div>

      <button
        onClick={isHabitDay ? () => onToggleHabit(habit) : undefined}
        disabled={!isHabitDay}
        className={`h-11 w-11 shrink-0 rounded-xl border-2 text-lg font-black flex items-center justify-center transition-transform ${
          isCompleted
            ? "border-signal bg-signal text-ink"
            : isSkipped
              ? "border-graphite bg-ash text-ink"
              : isHabitDay
                ? "border-graphite/50 bg-white cursor-pointer hover:border-ink active:scale-95"
                : "border-ash text-ash cursor-not-allowed"
        }`}
        aria-label={!isHabitDay ? `Next: ${nextHabitDay}` : "Toggle Habit"}
      >
        {isCompleted ? "✓" : isSkipped ? "✕" : null}
      </button>
    </div>
  );
});

export default HabitCard;
