import { describe, expect, it } from "vitest";
import {
  addDaysToKey,
  dateKeyInTimeZone,
  getTodayWeekdayKey,
  resolveTimeZone,
  weekdayKeyOfDateKey,
} from "@/lib/date";

describe("dateKeyInTimeZone", () => {
  // 2026-03-10 20:00 UTC == 2026-03-11 01:30 in Kolkata, 2026-03-10 13:00 in LA
  const instant = new Date("2026-03-10T20:00:00Z");

  it("uses the user's calendar day, not UTC", () => {
    expect(dateKeyInTimeZone(instant, "Asia/Kolkata")).toBe("2026-03-11");
    expect(dateKeyInTimeZone(instant, "America/Los_Angeles")).toBe("2026-03-10");
    expect(dateKeyInTimeZone(instant, "UTC")).toBe("2026-03-10");
  });

  it("is independent of the process time zone", () => {
    const before = process.env.TZ;
    process.env.TZ = "Asia/Kolkata";
    expect(dateKeyInTimeZone(new Date("2026-03-10T00:00:00Z"), "UTC")).toBe("2026-03-10");
    process.env.TZ = before;
  });

  it("derives weekday from the user's day", () => {
    expect(getTodayWeekdayKey("Asia/Kolkata", instant)).toBe("WED");
    expect(getTodayWeekdayKey("UTC", instant)).toBe("TUE");
  });
});

describe("key arithmetic", () => {
  it("adds days across month/year/leap boundaries", () => {
    expect(addDaysToKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToKey("2028-03-01", -1)).toBe("2028-02-29");
    expect(addDaysToKey("2026-03-08", 1)).toBe("2026-03-09"); // US DST day
  });

  it("maps keys to weekdays", () => {
    expect(weekdayKeyOfDateKey("2026-11-21")).toBe("SAT");
  });
});

describe("resolveTimeZone", () => {
  it("falls back to UTC for junk", () => {
    expect(resolveTimeZone("Not/AZone")).toBe("UTC");
    expect(resolveTimeZone(undefined)).toBe("UTC");
    expect(resolveTimeZone("Asia/Kolkata")).toBe("Asia/Kolkata");
  });
});
