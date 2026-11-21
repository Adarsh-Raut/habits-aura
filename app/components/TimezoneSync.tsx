"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TZ_COOKIE } from "@/lib/date";

/**
 * Keeps the `tz` cookie in sync with the browser's time zone so the server
 * computes "today" for the user's calendar day. Refreshes data when it changes.
 */
export default function TimezoneSync() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let timeZone: string;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!timeZone) return;

    const current = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${TZ_COOKIE}=`))
      ?.split("=")[1];

    if (current && decodeURIComponent(current) === timeZone) return;

    document.cookie = `${TZ_COOKIE}=${encodeURIComponent(timeZone)}; path=/; max-age=31536000; samesite=lax`;
    queryClient.invalidateQueries();
    router.refresh();
  }, [router, queryClient]);

  return null;
}
