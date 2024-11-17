"use client";

import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import confetti from "canvas-confetti";

interface Habit {
  id: string;
  icon: string;
  name: string;
  completed: boolean;
}

export default function Component() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", icon: "🚭", name: "Stop smoking", completed: false },
    { id: "2", icon: "💪", name: "Workout", completed: false },
    { id: "3", icon: "🚫", name: "No alcohol", completed: false },
    { id: "4", icon: "💪", name: "Workout", completed: false },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="bg-neutral rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-sm btn-circle">
              <BsThreeDotsVertical className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                {habit.icon}
              </span>
              <span
                className={`text-gray-200 font-extrabold decoration-2 ${
                  habit.completed ? "line-through" : ""
                }`}
              >
                {habit.name}
              </span>
            </div>
          </div>
          <label className="cursor-pointer">
            <input
              type="checkbox"
              checked={habit.completed}
              className={`checkbox checkbox-lg border-2 rounded-md ${
                habit.completed ? "checkbox-success" : ""
              }`}
              onChange={(e) => {
                toggleHabit(habit.id);
                const rect = e.target.getBoundingClientRect(); // Get checkbox position
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                  },
                });
                console.log(
                  `Toggled ${habit.name}, completed: ${!habit.completed}`
                );
              }}
              aria-label={`Mark ${habit.name} as ${
                habit.completed ? "incomplete" : "complete"
              }`}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
