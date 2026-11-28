import type { DayKey } from "./date";

export const HABIT_TEMPLATES: { title: string; days: DayKey[]; completionRate: number }[] = [
  { title: "Morning Workout", days: ["MON", "TUE", "WED", "THU", "FRI"], completionRate: 0.8 },
  { title: "Read 30 mins", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.9 },
  { title: "Meditate", days: ["SAT", "SUN"], completionRate: 0.5 },
  { title: "Evening Walk", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.7 },
  { title: "No Screens Before Bed", days: ["MON", "WED", "FRI"], completionRate: 0.6 },
  { title: "Drink 2L Water", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.75 },
];

export function getRandomCompletion(rate: number): "COMPLETED" | "SKIPPED" | null {
  const rand = Math.random();
  if (rand < rate) {
    return "COMPLETED";
  } else if (rand < rate + 0.2) {
    return "SKIPPED";
  }
  return null;
}
