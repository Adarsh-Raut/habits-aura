import { describe, expect, it } from "vitest";
import { auraDelta, auraForCounts } from "@/lib/aura";

describe("aura", () => {
  it("complete = +10, skip = -10 relative to untouched", () => {
    expect(auraDelta(null, "COMPLETED")).toBe(10);
    expect(auraDelta("COMPLETED", "SKIPPED")).toBe(-20);
    expect(auraDelta("SKIPPED", null)).toBe(10);
  });

  it("a full toggle cycle nets zero", () => {
    const total =
      auraDelta(null, "COMPLETED") +
      auraDelta("COMPLETED", "SKIPPED") +
      auraDelta("SKIPPED", null);
    expect(total).toBe(0);
  });

  it("matches the per-habit total used on delete", () => {
    expect(auraForCounts(5, 2)).toBe(30);
  });
});
