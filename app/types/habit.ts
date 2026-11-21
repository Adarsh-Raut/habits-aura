export type HabitStatus = "NONE" | "COMPLETED" | "SKIPPED";

export type Habit = {
  id: string;
  title: string;
  status: HabitStatus;
  createdAt: Date;
  streak: number;
  days: string[];
};
