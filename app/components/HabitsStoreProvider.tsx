"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Habit } from "@/app/types/habit";

type DirtyHabit = Habit | null;

type HabitsStoreContextValue = {
  habits: Habit[];
  todayWeekdayKey: string;
  hasHydrated: boolean;
  hydrateHabits: (serverHabits: Habit[], todayWeekdayKey: string) => void;
  upsertHabit: (habit: Habit) => void;
  updateHabit: (habitId: string, updater: (habit: Habit) => Habit) => void;
  removeHabit: (habitId: string) => void;
  restoreHabit: (habit: Habit) => void;
};

const HabitsStoreContext = createContext<HabitsStoreContextValue | null>(null);

function sortHabits(habits: Habit[]) {
  return [...habits].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
}

function habitsEqual(a: Habit, b: Habit) {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.status === b.status &&
    a.streak === b.streak &&
    a.createdAt.getTime() === b.createdAt.getTime() &&
    a.days.length === b.days.length &&
    a.days.every((day, index) => day === b.days[index])
  );
}

export function HabitsStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayWeekdayKey, setTodayWeekdayKey] = useState("SUN");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [dirtyHabits, setDirtyHabits] = useState<Record<string, DirtyHabit>>({});

  const hydrateHabits = useCallback(
    (serverHabits: Habit[], nextTodayWeekdayKey: string) => {
      setTodayWeekdayKey(nextTodayWeekdayKey);
      setHasHydrated(true);

      setHabits(() => {
        const mergedHabits = new Map(serverHabits.map((habit) => [habit.id, habit]));
        const nextDirtyHabits: Record<string, DirtyHabit> = { ...dirtyHabits };

        for (const [habitId, dirtyHabit] of Object.entries(dirtyHabits)) {
          const serverHabit = mergedHabits.get(habitId);

          if (dirtyHabit === null) {
            if (serverHabit) {
              mergedHabits.delete(habitId);
            } else {
              delete nextDirtyHabits[habitId];
            }

            continue;
          }

          if (serverHabit && habitsEqual(serverHabit, dirtyHabit)) {
            delete nextDirtyHabits[habitId];
            mergedHabits.set(habitId, serverHabit);
            continue;
          }

          mergedHabits.set(habitId, dirtyHabit);
        }

        if (Object.keys(nextDirtyHabits).length !== Object.keys(dirtyHabits).length) {
          setDirtyHabits(nextDirtyHabits);
        }

        return sortHabits(Array.from(mergedHabits.values()));
      });
    },
    [dirtyHabits],
  );

  const updateHabit = useCallback(
    (habitId: string, updater: (habit: Habit) => Habit) => {
      setHabits((currentHabits) => {
        let updatedHabit: Habit | null = null;
        const nextHabits = currentHabits.map((habit) => {
          if (habit.id !== habitId) return habit;
          updatedHabit = updater(habit);
          return updatedHabit;
        });

        if (updatedHabit) {
          setDirtyHabits((currentDirtyHabits) => ({
            ...currentDirtyHabits,
            [habitId]: updatedHabit,
          }));
        }

        return nextHabits;
      });
    },
    [],
  );

  const upsertHabit = useCallback((habit: Habit) => {
    setHasHydrated(true);
    setHabits((currentHabits) => {
      const existingHabit = currentHabits.find((item) => item.id === habit.id);
      const nextHabits = existingHabit
        ? currentHabits.map((item) => (item.id === habit.id ? habit : item))
        : [...currentHabits, habit];

      return sortHabits(nextHabits);
    });
    setDirtyHabits((currentDirtyHabits) => ({
      ...currentDirtyHabits,
      [habit.id]: habit,
    }));
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    setHabits((currentHabits) =>
      currentHabits.filter((habit) => habit.id !== habitId),
    );
    setDirtyHabits((currentDirtyHabits) => ({
      ...currentDirtyHabits,
      [habitId]: null,
    }));
  }, []);

  const restoreHabit = useCallback((habit: Habit) => {
    setHabits((currentHabits) => {
      const withoutHabit = currentHabits.filter((item) => item.id !== habit.id);
      return sortHabits([...withoutHabit, habit]);
    });
    setDirtyHabits((currentDirtyHabits) => {
      const nextDirtyHabits = { ...currentDirtyHabits };
      delete nextDirtyHabits[habit.id];
      return nextDirtyHabits;
    });
  }, []);

  const value = useMemo(
    () => ({
      habits,
      todayWeekdayKey,
      hasHydrated,
      hydrateHabits,
      upsertHabit,
      updateHabit,
      removeHabit,
      restoreHabit,
    }),
    [
      habits,
      todayWeekdayKey,
      hasHydrated,
      hydrateHabits,
      upsertHabit,
      updateHabit,
      removeHabit,
      restoreHabit,
    ],
  );

  return (
    <HabitsStoreContext.Provider value={value}>
      {children}
    </HabitsStoreContext.Provider>
  );
}

export function useHabitsStore() {
  const context = useContext(HabitsStoreContext);

  if (!context) {
    throw new Error("useHabitsStore must be used within HabitsStoreProvider");
  }

  return context;
}
