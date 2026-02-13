"use client";

import { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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

export default function Habit() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabits = async () => {
      const response = await fetch("/api/habit");
      const data = await response.json();
      setHabits(data);
    };
    fetchHabits();
  }, []);

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));

    try {
      const res = await fetch(`/api/habit/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
    } catch {
      // rollback
      const res = await fetch("/api/habit");
      const data = await res.json();
      setHabits(data);
    }
  };

  const toggleHabit = async (id: string) => {
    setLoadingHabitId(id);

    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id
          ? { ...habit, status: nextStatusMap[habit.status] }
          : habit,
      ),
    );

    try {
      const response = await fetch(`/api/habit/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error();
    } catch (error) {
      console.error(error);
      const response = await fetch("/api/habit");
      const data = await response.json();
      setHabits(data);
    } finally {
      setLoadingHabitId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {habits.map((habit) => {
        const isCompleted = habit.status === "COMPLETED";
        const isSkipped = habit.status === "SKIPPED";

        return (
          <div
            key={habit.id}
            className={`bg-neutral rounded-xl p-4 flex items-center justify-between transition-all duration-200 ${
              isCompleted ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="dropdown dropdown-bottom">
                <button
                  tabIndex={0}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <BsThreeDotsVertical className="w-4 h-4 text-gray-400" />
                </button>

                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-40"
                >
                  <li>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-error"
                    >
                      Delete habit
                    </button>
                  </li>
                </ul>
              </div>

              <span
                className={`text-gray-200 text-lg font-extrabold decoration-2 ${
                  isCompleted ? "line-through" : ""
                } ${isSkipped ? "text-error" : ""}`}
              >
                {habit.title}
              </span>
            </div>

            <button
              onClick={() => toggleHabit(habit.id)}
              disabled={loadingHabitId === habit.id}
              aria-label={`Update habit ${habit.title}`}
              className={`checkbox checkbox-lg border-2 rounded-md flex items-center justify-center ${
                isCompleted
                  ? "checkbox-success"
                  : isSkipped
                    ? "checkbox-error"
                    : ""
              }`}
            >
              {loadingHabitId === habit.id ? (
                <AiOutlineLoading3Quarters className="animate-spin text-sm" />
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
  );
}
