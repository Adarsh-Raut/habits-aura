"use client";

import { useState } from "react";
import HabitCard from "./HabitCard";
import type { Habit } from "@/app/types/habit";

type HabitListProps = {
  initialHabits: Habit[];
};

export default function HabitList({ initialHabits }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} setHabits={setHabits} />
      ))}
    </div>
  );
}
