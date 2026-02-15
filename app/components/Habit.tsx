"use client";

import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface Habit {
  id: string;
  title: string;
  status: "NONE" | "COMPLETED" | "SKIPPED";
}

const nextStatusMap: Record<Habit["status"], Habit["status"]> = {
  NONE: "COMPLETED",
  COMPLETED: "SKIPPED",
  SKIPPED: "NONE",
};

const titleVariants: Variants = {
  active: {
    scale: 1,
    opacity: 1,
    color: "#E5E7EB",
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
  completed: {
    scale: 0.96,
    opacity: 0.55,
    color: "#9CA3AF",
    transition: {
      type: "spring",
      stiffness: 220,
      damping: 26,
    },
  },
};

export default function Habit() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuFor(null);
        setMenuPos(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXTAUTH_URL}/api/habit`)
      .then((r) => r.json())
      .then(setHabits);
  }, []);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 160;

    const left = Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8);

    setMenuPos({
      top: rect.bottom + 6,
      left,
    });

    setMenuFor(id);
  };

  const closeMenu = () => {
    setMenuFor(null);
    setMenuPos(null);
  };

  const deleteHabit = async (id: string) => {
    closeMenu();
    setHabits((prev) => prev.filter((h) => h.id !== id));
    await fetch(`${process.env.NEXTAUTH_URL}/api/habit/${id}`, {
      method: "DELETE",
    });
  };

  const toggleHabit = async (id: string) => {
    setLoadingHabitId(id);
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, status: nextStatusMap[h.status] } : h,
      ),
    );
    await fetch(`${process.env.NEXTAUTH_URL}/api/habit/${id}`, {
      method: "PATCH",
    });
    setLoadingHabitId(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {habits.map((habit) => {
          const isCompleted = habit.status === "COMPLETED";
          const isSkipped = habit.status === "SKIPPED";

          return (
            <div
              key={habit.id}
              className="bg-neutral rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={(e) => openMenu(e, habit.id)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <BsThreeDotsVertical className="w-5 h-5 text-gray-400" />
                </button>

                <motion.span
                  layout
                  variants={titleVariants}
                  initial={false}
                  animate={isCompleted ? "completed" : "active"}
                  className={`
      relative truncate font-semibold text-base sm:text-lg
      flex items-center gap-2
      ${isSkipped ? "text-error" : ""}
    `}
                >
                  {habit.title}

                  <AnimatePresence>
                    {isCompleted && (
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 24,
                        }}
                        className="absolute left-0 top-1/2 h-[2px] w-full bg-current origin-left"
                      />
                    )}
                  </AnimatePresence>
                </motion.span>
              </div>

              <button
                onClick={() => toggleHabit(habit.id)}
                disabled={loadingHabitId === habit.id}
                className={`
      w-10 h-10 rounded-md border-2 flex items-center justify-center
      ${
        isCompleted
          ? "border-success text-success"
          : isSkipped
            ? "border-error text-error"
            : "border-gray-500"
      }
    `}
              >
                {loadingHabitId === habit.id ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : isCompleted ? (
                  "✓"
                ) : isSkipped ? (
                  "✕"
                ) : null}
              </button>
            </div>
          );
        })}
      </div>

      {menuFor && menuPos && (
        <div
          ref={menuRef}
          className="fixed z-[9999] bg-base-200 rounded-lg shadow-xl w-20"
          style={{
            top: menuPos.top,
            left: menuPos.left,
          }}
        >
          <button
            className="w-full text-left px-4 py-2 text-error hover:bg-base-300"
            onClick={() => deleteHabit(menuFor)}
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
}
