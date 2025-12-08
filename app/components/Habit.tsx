"use client";

import { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import confetti from "canvas-confetti";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useRouter } from "next/navigation";

interface Habit {
  id: string;
  title: string;
  isCompleted: boolean;
}

export default function Habit() {
  const [habits, setHabits] = useState<Habit[]>();
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHabits = async () => {
      const response = await fetch("/api/habit");
      const data = await response.json();
      console.log(data);
      setHabits(data);
    };
    fetchHabits();
  }, []);

  const toggleHabit = async (id: string) => {
    const currentHabit = habits?.find((habit) => habit.id === id);

    setLoadingHabitId(id);
    const updatedHabits = habits?.map((habit) =>
      habit.id === id ? { ...habit, isCompleted: !habit.isCompleted } : habit
    );
    setHabits(updatedHabits);

    try {
      const response = await fetch(`/api/habit/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted: !currentHabit?.isCompleted,
        }),
      });

      if (!response.ok) {
        setHabits(habits);
        throw new Error("Failed to update habit");
      }
    } catch (error) {
      console.error("Error updating habit:", error);
      setHabits(habits);
    } finally {
      setLoadingHabitId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {habits?.map((habit) => (
        <div
          key={habit.id}
          className={`bg-neutral rounded-xl p-4 flex items-center justify-between transition-all duration-200 ${
            habit.isCompleted ? "opacity-50" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-sm btn-circle">
              <BsThreeDotsVertical className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-gray-200 text-lg font-extrabold decoration-2 ${
                  habit.isCompleted ? "line-through" : ""
                }`}
              >
                {habit.title}
              </span>
            </div>
          </div>
          <label className="cursor-pointer">
            <input
              type="checkbox"
              checked={habit.isCompleted}
              className={`checkbox checkbox-lg border-2 rounded-md ${
                habit.isCompleted ? "checkbox-success" : ""
              }`}
              onChange={(e) => {
                toggleHabit(habit.id);
                // if (!habit.isCompleted) {
                //   const rect = e.target.getBoundingClientRect();
                //   confetti({
                //     particleCount: 100,
                //     spread: 70,
                //     origin: {
                //       x: (rect.left + rect.width / 2) / window.innerWidth,
                //       y: (rect.top + rect.height / 2) / window.innerHeight,
                //     },
                //   });
                // }
              }}
              aria-label={`Mark ${habit.title} as ${
                habit.isCompleted ? "incomplete" : "complete"
              }`}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
