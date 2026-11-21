import { DAY_KEYS } from "@/lib/date";

export const MAX_TITLE_LENGTH = 120;

export type HabitInput = { title: string; days: string[] };

/** Validates a create/update habit body. Returns an error message on failure. */
export function parseHabitInput(
  body: unknown,
): { ok: true; value: HabitInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid input" };
  }

  const { title, days } = body as { title?: unknown; days?: unknown };

  if (typeof title !== "string" || !title.trim()) {
    return { ok: false, error: "Title is required" };
  }

  const trimmed = title.trim();
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title must be at most ${MAX_TITLE_LENGTH} characters`,
    };
  }

  if (!Array.isArray(days) || days.length === 0) {
    return { ok: false, error: "Pick at least one day" };
  }

  if (!days.every((d) => typeof d === "string" && DAY_KEYS.includes(d))) {
    return { ok: false, error: "Invalid days" };
  }

  const unique = DAY_KEYS.filter((d) => days.includes(d));
  return { ok: true, value: { title: trimmed, days: unique } };
}
