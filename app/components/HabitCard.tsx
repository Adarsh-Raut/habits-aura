"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isCompleted = habit.status === "COMPLETED";
  const isSkipped = habit.status === "SKIPPED";

  async function toggleHabit() {
    setLoading(true);

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id ? { ...h, status: nextStatusMap[h.status] } : h,
      ),
    );

    try {
      await fetch(`/api/habit/${habit.id}`, { method: "PATCH" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteHabit() {
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    await fetch(`/api/habit/${habit.id}`, { method: "DELETE" });
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
      </div>

      {/* RIGHT */}
      <button
        onClick={toggleHabit}
        disabled={loading}
        className={`w-10 h-10 rounded-md border-2 flex items-center justify-center ${
          isCompleted
            ? "border-success text-success"
            : isSkipped
              ? "border-error text-error"
              : "border-gray-500"
        }`}
      >
        {loading ? (
          <AiOutlineLoading3Quarters className="animate-spin" />
        ) : isCompleted ? (
          "✓"
        ) : isSkipped ? (
          "✕"
        ) : null}
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
