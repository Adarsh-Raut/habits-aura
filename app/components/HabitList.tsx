"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { IoPencil, IoTrashBin } from "react-icons/io5";
import { toast } from "sonner";
import HabitCard from "./HabitCard";
import EmptyState from "./EmptyState";
import type { Habit } from "@/app/types/habit";
import { useHabitsStore } from "./HabitsStoreProvider";
import { playCompleteSound, preloadCompleteSound } from "@/lib/audio";
import Portal from "./Portal";
import { useRouter } from "next/navigation";

type HabitListProps = {
  initialHabits: Habit[];
  todayWeekdayKey: string;
};

type MenuState = {
  habitId: string;
  top: number;
  left: number;
} | null;

const nextStatusMap: Record<"NONE" | "COMPLETED" | "SKIPPED", "NONE" | "COMPLETED" | "SKIPPED"> = {
  NONE: "COMPLETED",
  COMPLETED: "SKIPPED",
  SKIPPED: "NONE",
};

function getOptimisticStreak(
  currentStatus: "NONE" | "COMPLETED" | "SKIPPED",
  currentStreak: number,
  nextStatus: "NONE" | "COMPLETED" | "SKIPPED",
) {
  if (currentStatus === "NONE" && nextStatus === "COMPLETED") {
    return currentStreak + 1;
  }

  if (currentStatus === "COMPLETED" && nextStatus === "SKIPPED") {
    return 0;
  }

  if (currentStatus === "SKIPPED" && nextStatus === "NONE") {
    return 0;
  }

  return currentStreak;
}

export default function HabitList({
  initialHabits,
  todayWeekdayKey,
}: HabitListProps) {
  const router = useRouter();
  const {
    habits,
    hasHydrated,
    hydrateHabits,
    updateHabit,
    removeHabit,
    restoreHabit,
  } = useHabitsStore();
  const [menuState, setMenuState] = useState<MenuState>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateHabits(initialHabits, todayWeekdayKey);
  }, [hydrateHabits, initialHabits, todayWeekdayKey]);

  useEffect(() => {
    preloadCompleteSound();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuState) {
        return;
      }

      const target = event.target as Element | null;
      const clickedTrigger = target?.closest(
        `[data-habit-menu-trigger="${menuState.habitId}"]`,
      );

      if (clickedTrigger) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuState(null);
      }
    }

    if (menuState) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuState]);

  const displayedHabits = hasHydrated ? habits : initialHabits;

  function openMenu(habit: Habit, trigger: HTMLButtonElement) {
    const rect = trigger.getBoundingClientRect();
    const menuWidth = 200;
    const menuHeight = 120;
    const padding = 8;

    let left = (rect.left + rect.right) / 2 - menuWidth / 2;

    if (left < padding) {
      left = padding;
    }

    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }

    let top = rect.bottom + padding;
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - padding;
    }

    setMenuState({ habitId: habit.id, top, left });
  }

  function openEditHabit(habit: Habit) {
    setMenuState(null);
    router.push(`/habit/${habit.id}/edit?refresh=${Date.now()}`);
  }

  async function toggleHabit(habit: Habit) {
    const previousStatus = habit.status;
    const previousStreak = habit.streak;
    const newStatus = nextStatusMap[habit.status];
    const optimisticStreak = getOptimisticStreak(
      previousStatus,
      previousStreak,
      newStatus,
    );

    if (previousStatus !== "COMPLETED" && newStatus === "COMPLETED") {
      playCompleteSound();
    }

    updateHabit(habit.id, (currentHabit) => ({
      ...currentHabit,
      status: newStatus,
      streak: optimisticStreak,
    }));

    try {
      const res = await fetch(`/api/habit/${habit.id}`, { method: "PATCH" });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();

      updateHabit(habit.id, (currentHabit) => ({
        ...currentHabit,
        streak: data.currentStreak,
      }));

      startTransition(() => {
        router.refresh();
      });
    } catch {
      restoreHabit({
        ...habit,
        status: previousStatus,
        streak: previousStreak,
      });
      toast.error("Failed to update habit. Please try again.");
    }
  }

  async function deleteHabit(habit: Habit) {
    removeHabit(habit.id);
    setMenuState(null);

    try {
      const res = await fetch(`/api/habit/${habit.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Habit deleted");

      startTransition(() => {
        router.refresh();
      });
    } catch {
      restoreHabit(habit);
      toast.error("Failed to delete habit. Please try again.");
    }
  }

  const activeHabit =
    menuState ? displayedHabits.find((habit) => habit.id === menuState.habitId) ?? null : null;

  if (displayedHabits.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            todayWeekdayKey={todayWeekdayKey}
            onToggleHabit={toggleHabit}
            onOpenMenu={openMenu}
          />
        ))}
      </div>
      <Portal>
        <div
          ref={menuRef}
          className={`fixed bg-base-200 border border-base-300 rounded-xl p-1 sm:p-2 shadow-xl z-[100] w-auto min-w-[80px] sm:min-w-[140px] max-w-[200px] transition-opacity duration-150 ${
            menuState && activeHabit
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          }`}
          style={{
            top: menuState?.top ?? 0,
            left: menuState?.left ?? 0,
          }}
        >
          {activeHabit && (
            <>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-200 hover:bg-base-300 rounded-lg transition-colors"
                onClick={() => openEditHabit(activeHabit)}
              >
                <IoPencil className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => deleteHabit(activeHabit)}
                className="w-full flex items-center gap-3 px-3 py-2 text-error hover:bg-base-300 rounded-lg transition-colors"
              >
                <IoTrashBin className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>
      </Portal>
    </>
  );
}
