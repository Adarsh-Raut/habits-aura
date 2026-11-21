/** Must match the `auraPoints` default in prisma/schema.prisma. */
export const STARTING_AURA = 100;
export const COMPLETE_AURA = 10;
export const SKIP_AURA = -10;

export type CompletionAction = "COMPLETED" | "SKIPPED";

/** Aura a single day's state is worth (no record = 0). */
export function auraForAction(action: CompletionAction | null | undefined) {
  if (action === "COMPLETED") return COMPLETE_AURA;
  if (action === "SKIPPED") return SKIP_AURA;
  return 0;
}

/** Aura change when a day moves from one state to another. */
export function auraDelta(
  from: CompletionAction | null | undefined,
  to: CompletionAction | null | undefined,
) {
  return auraForAction(to) - auraForAction(from);
}

/** Aura a habit has contributed, given its completion counts. */
export function auraForCounts(completed: number, skipped: number) {
  return completed * COMPLETE_AURA + skipped * SKIP_AURA;
}

/** What a user's aura should be, derived purely from their completions. */
export function expectedAura(completed: number, skipped: number) {
  return STARTING_AURA + auraForCounts(completed, skipped);
}
