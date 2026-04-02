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
    <div className={`bg-neutral rounded-xl p-4 flex items-center justify-between transition-all duration-300 ${!isHabitDay ? "opacity-50 grayscale" : ""}`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={(event) =>
            onOpenMenu(habit, event.currentTarget)
          }
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="More Options"
          data-habit-menu-trigger={habit.id}
        >
          <BsThreeDotsVertical className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`relative truncate font-semibold text-base sm:text-lg ${
              isSkipped ? "text-error" : "text-gray-200"
            } ${isCompleted ? "opacity-55" : "opacity-100"} transition-opacity duration-300`}
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
            <span className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full shrink-0">
              <FaFireAlt className="w-3 h-3" />
              {habit.streak}
            </span>
          ) : (
            <span className="text-xs text-gray-600 flex items-center gap-1 shrink-0">
              <IoRocketOutline className="w-3 h-3" />
            </span>
          )}
          {!isHabitDay && nextHabitDay && (
            <span className="text-sm text-gray-400 ml-2 shrink-0 font-medium">
              Next: {nextHabitDay}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={isHabitDay ? () => onToggleHabit(habit) : undefined}
        disabled={!isHabitDay}
        className={`w-10 h-10 rounded-md border-2 flex items-center justify-center transition-transform ${
          isCompleted
            ? "border-success text-success"
            : isSkipped
              ? "border-error text-error"
              : isHabitDay
                ? "border-gray-500 cursor-pointer active:scale-95"
                : "border-gray-700 text-gray-600 cursor-not-allowed"
        }`}
        aria-label={!isHabitDay ? `Next: ${nextHabitDay}` : "Toggle Habit"}
      >
        {isCompleted ? "✓" : isSkipped ? "✕" : null}
      </button>
    </div>
  );
});

export default HabitCard;
