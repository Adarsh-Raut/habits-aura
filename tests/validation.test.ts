import { describe, expect, it } from "vitest";
import { parseHabitInput } from "@/lib/validation";

const ok = (b: unknown) => parseHabitInput(b);

describe("parseHabitInput", () => {
  it("accepts and normalises valid input", () => {
    const r = ok({ title: "  Read  ", days: ["WED", "MON", "MON"] });
    expect(r).toEqual({ ok: true, value: { title: "Read", days: ["MON", "WED"] } });
  });

  it.each([
    [null],
    ["str"],
    [{}],
    [{ title: 5, days: ["MON"] }],
    [{ title: "   ", days: ["MON"] }],
    [{ title: "x".repeat(121), days: ["MON"] }],
    [{ title: "a", days: [] }],
    [{ title: "a", days: ["xyz"] }],
    [{ title: "a", days: "MON" }],
    [{ title: "a", days: [1] }],
  ])("rejects %j", (body) => {
    expect(ok(body).ok).toBe(false);
  });
});
