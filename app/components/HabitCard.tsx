"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaFireAlt } from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { toast } from "sonner";
import { playCompleteSound } from "@/lib/audio";
import type { Habit, HabitStatus } from "@/app/types/habit";

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

export default function HabitCard({ habit, setHabits }: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isCompleted = habit.status === "COMPLETED";
  const isSkipped = habit.status === "SKIPPED";

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

        const newStreak =
          previousStatus === "COMPLETED" && newStatus !== "COMPLETED"
            ? h.streak - 1
            : newStatus === "COMPLETED"
              ? h.streak + 1
              : h.streak;

        return { ...h, status: newStatus, streak: newStreak };
      }),
    );

    try {
      const res = await fetch(`/api/habit/${habit.id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to update");
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
    setMenuOpen(false);

    try {
      const res = await fetch(`/api/habit/${habit.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.error("Habit deleted");
    } catch {
      setHabits((prev) => [habit, ...prev]);
      toast.error("Failed to delete habit. Please try again.");
    }
  }

  return (
    <div className="bg-neutral rounded-xl p-4 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="btn btn-ghost btn-sm btn-circle"
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
        </div>
      </div>

      {/* RIGHT */}
      <button
        onClick={toggleHabit}
        className={`w-10 h-10 rounded-md border-2 flex items-center justify-center transition-transform active:scale-95 ${
          isCompleted
            ? "border-success text-success"
            : isSkipped
              ? "border-error text-error"
              : "border-gray-500"
        }`}
      >
        {isCompleted ? "✓" : isSkipped ? "✕" : null}
      </button>

      {/* MENU */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute mt-12 bg-base-200 rounded-lg shadow-xl z-50"
        >
          <button
            onClick={deleteHabit}
            className="px-4 py-2 text-error hover:bg-base-300 w-full text-left"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
