export const DAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function getTodayWeekdayKey() {
  return DAY_KEYS[new Date().getDay()];
}

export function getTodayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getTodayDateKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export function getDateKey(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export function isTodayHabitDay(habitDays: string[]): boolean {
  return habitDays.includes(getTodayWeekdayKey());
}

export function getNextHabitDay(
  habitDays: string[],
  fromDate: Date = new Date()
): string | null {
  if (habitDays.length === 0) return null;

  const currentDay = fromDate.getDay();

  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const dayKey = DAY_KEYS[checkDay];
    if (habitDays.includes(dayKey)) {
      return dayKey;
    }
  }

  return null;
}
