import { cookies } from "next/headers";
import { resolveTimeZone, TZ_COOKIE } from "@/lib/date";

/** Server-only: the user's IANA time zone from the `tz` cookie (UTC fallback). */
export function getUserTimeZone(): string {
  return resolveTimeZone(cookies().get(TZ_COOKIE)?.value);
}
