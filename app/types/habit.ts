export type HabitStatus = "NONE" | "COMPLETED" | "SKIPPED";

export type DbHabit = {
  id: string;
  title: string;
  days: string[];
  userId: string;
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
};

export type Habit = {
  id: string;
  title: string;
  status: HabitStatus;
  createdAt: Date;
  streak: number;
  days: string[];
};
