"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import HabitCard from "./HabitCard";
import EmptyState from "./EmptyState";
import type { Habit } from "@/app/types/habit";

type HabitListProps = {
  initialHabits: Habit[];
};

export default function HabitList({ initialHabits }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const handleSetHabits = useCallback<Dispatch<SetStateAction<Habit[]>>>(
    (updater) => {
      setHabits(updater);
    },
    []
  );

  if (habits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} setHabits={handleSetHabits} />
      ))}
    </div>
  );
}
