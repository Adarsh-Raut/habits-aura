export const DAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function getTodayKey() {
  return DAY_KEYS[new Date().getDay()];
}

export function getTodayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
