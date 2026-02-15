export type HabitStatus = "NONE" | "COMPLETED" | "SKIPPED";

export type DbHabit = {
  id: string;
  title: string;
  days: string[];
  userId: string;
  createdAt: Date;
};

export type Habit = {
  id: string;
  title: string;
  status: HabitStatus;
  createdAt: Date;
};
