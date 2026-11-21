import { describe, expect, it } from "vitest";
import { calculateStreaks } from "@/lib/streaks";

const ALL = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const keys = (...k: string[]) => k.map((dateKey) => ({ dateKey }));
// Sat 2026-11-21 noon UTC
const NOW = new Date("2026-11-21T12:00:00Z");
const CREATED = new Date("2026-11-01T00:00:00Z");
const opts = { timeZone: "UTC", now: NOW, graceToday: true };

describe("calculateStreaks", () => {
  it("returns zeros with no completions", () => {
    expect(calculateStreaks([], ALL, CREATED, opts)).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it("counts consecutive daily completions", () => {
    const r = calculateStreaks(keys("2026-11-19", "2026-11-20", "2026-11-21"), ALL, CREATED, opts);
    expect(r).toEqual({ currentStreak: 3, longestStreak: 3 });
  });

  it("grace: today not done yet keeps yesterday's streak", () => {
    const r = calculateStreaks(keys("2026-11-19", "2026-11-20"), ALL, CREATED, opts);
    expect(r.currentStreak).toBe(2);
  });

  it("no grace: today not done breaks current streak", () => {
    const r = calculateStreaks(keys("2026-11-19", "2026-11-20"), ALL, CREATED, { ...opts, graceToday: false });
    expect(r.currentStreak).toBe(0);
    expect(r.longestStreak).toBe(2);
  });

  it("a missed scheduled day breaks the streak; longest is kept", () => {
    const r = calculateStreaks(
      keys("2026-11-10", "2026-11-11", "2026-11-12", "2026-11-14", "2026-11-15"),
      ALL, CREATED, { ...opts, graceToday: false },
    );
    expect(r.longestStreak).toBe(3);
    expect(r.currentStreak).toBe(0);
  });

  it("skips non-scheduled days (Mon/Wed/Fri habit)", () => {
    // Mon 16, Wed 18, Fri 20 are consecutive scheduled days
    const r = calculateStreaks(keys("2026-11-16", "2026-11-18", "2026-11-20"), ["MON", "WED", "FRI"], CREATED, opts);
    expect(r).toEqual({ currentStreak: 3, longestStreak: 3 });
  });

  it("ignores completions before creation or on unscheduled days", () => {
    const r = calculateStreaks(keys("2026-10-30", "2026-11-17"), ["MON", "WED", "FRI"], CREATED, opts);
    expect(r).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it("uses the user's time zone for 'today' (Kolkata is already Sunday)", () => {
    const lateSat = new Date("2026-11-21T20:00:00Z"); // Sun 01:30 IST
    const r = calculateStreaks(keys("2026-11-21"), ALL, CREATED, { timeZone: "Asia/Kolkata", now: lateSat, graceToday: true });
    // Sunday (today) not done yet -> grace -> Saturday counted
    expect(r.currentStreak).toBe(1);
    const utc = calculateStreaks(keys("2026-11-21"), ALL, CREATED, { timeZone: "UTC", now: lateSat, graceToday: true });
    expect(utc.currentStreak).toBe(1);
  });

  it("is not affected by the process time zone", () => {
    const before = process.env.TZ;
    process.env.TZ = "Pacific/Kiritimati"; // UTC+14
    const r = calculateStreaks(keys("2026-11-20", "2026-11-21"), ALL, CREATED, opts);
    process.env.TZ = before;
    expect(r).toEqual({ currentStreak: 2, longestStreak: 2 });
  });
});
