"use server";

import { getAppSession } from "@/lib/auth";
import { resetGuest } from "@/lib/guest";
import { guestResetLimiter } from "@/lib/ratelimit";
import { getUserTimeZone } from "@/lib/timezone";

export async function resetGuestDemo() {
  const session = await getAppSession();
  if (session?.user.guestExpiresAt === undefined) {
    return { ok: false as const, error: "Start a guest demo to use this action." };
  }

  const limit = await guestResetLimiter.limit(session.user.id);
  if (!limit.success) {
    return { ok: false as const, error: "Please wait before resetting again." };
  }

  const reset = await resetGuest(session.user.id, getUserTimeZone());
  return reset
    ? { ok: true as const }
    : { ok: false as const, error: "This demo has expired. Start a new one to continue." };
}
