"use client";

import { memo, Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaFireAlt } from "react-icons/fa";
import { IoRocketOutline, IoTrashBin, IoPencil } from "react-icons/io5";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { toast } from "sonner";
import { playCompleteSound } from "@/lib/audio";
import type { Habit, HabitStatus } from "@/app/types/habit";
import Portal from "./Portal";
import { isTodayHabitDay, getNextHabitDay } from "@/lib/date";

type HabitCardProps = {
  habit: Habit;
  setHabits: Dispatch<SetStateAction<Habit[]>>;
};

const nextStatusMap: Record<HabitStatus, HabitStatus> = {
  NONE: "COMPLETED",
  COMPLETED: "SKIPPED",
  SKIPPED: "NONE",
};

const titleVariants: Variants = {
  active: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
  completed: {
    scale: 0.96,
    opacity: 0.55,
    transition: { type: "spring", stiffness: 220, damping: 26 },
  },
};

const HabitCard = memo(function HabitCard({ habit, setHabits }: HabitCardProps) {
  const [menuState, setMenuState] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCompleted = habit.status === "COMPLETED";
  const isSkipped = habit.status === "SKIPPED";
  const isHabitDay = isTodayHabitDay(habit.days);
  const nextHabitDay = getNextHabitDay(habit.days);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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

  function openMenu() {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
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

    setMenuState({ top, left });
  }

  async function toggleHabit() {
    const previousStatus = habit.status;
    const previousStreak = habit.streak;
    const newStatus = nextStatusMap[habit.status];

    if (previousStatus !== "COMPLETED" && newStatus === "COMPLETED") {
      playCompleteSound();
    }

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habit.id) return h;
        return { ...h, status: newStatus };
      }),
    );

    try {
      const res = await fetch(`/api/habit/${habit.id}`, { method: "PATCH" });
      
      if (!res.ok) throw new Error("Failed to update");
      
      const data = await res.json();
      
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habit.id) return h;
          return { ...h, streak: data.currentStreak };
        }),
      );
    } catch {
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habit.id) return h;
          return { ...h, status: previousStatus, streak: previousStreak };
        }),
      );
      toast.error("Failed to update habit. Please try again.");
    }
  }

  async function deleteHabit() {
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    setMenuState(null);

    try {
      const res = await fetch(`/api/habit/${habit.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Habit deleted");
    } catch {
      setHabits((prev) => [habit, ...prev]);
      toast.error("Failed to delete habit. Please try again.");
    }
  }

  return (
    <div className={`bg-neutral rounded-xl p-4 flex items-center justify-between transition-all duration-300 ${!isHabitDay ? "opacity-50 grayscale" : ""}`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          ref={buttonRef}
          onClick={openMenu}
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="More Options"
        >
          <BsThreeDotsVertical className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex items-center gap-2">
          <motion.span
            layout
            variants={titleVariants}
            animate={isCompleted ? "completed" : "active"}
            className={`relative truncate font-semibold text-base sm:text-lg ${
              isSkipped ? "text-error" : "text-gray-200"
            }`}
          >
            {habit.title}

            <AnimatePresence>
              {isCompleted && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="absolute left-0 top-1/2 h-[2px] w-full bg-current origin-left"
                />
              )}
            </AnimatePresence>
          </motion.span>

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
        onClick={isHabitDay ? toggleHabit : undefined}
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

      <Portal>
        <div
          ref={menuRef}
          className={`fixed bg-base-200 border border-base-300 rounded-xl p-1 sm:p-2 shadow-xl z-[100] w-auto min-w-[80px] sm:min-w-[140px] max-w-[200px] transition-opacity duration-150 ${
            menuState
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          }`}
          style={{
            top: menuState?.top ?? 0,
            left: menuState?.left ?? 0,
          }}
        >
          <Link
            href={`/habit/${habit.id}/edit`}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-200 hover:bg-base-300 rounded-lg transition-colors"
            onClick={() => setMenuState(null)}
          >
            <IoPencil className="w-5 h-5 shrink-0" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          <button
            onClick={deleteHabit}
            className="w-full flex items-center gap-3 px-3 py-2 text-error hover:bg-base-300 rounded-lg transition-colors"
          >
            <IoTrashBin className="w-5 h-5 shrink-0" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </Portal>
    </div>
  );
});

export default HabitCard;
