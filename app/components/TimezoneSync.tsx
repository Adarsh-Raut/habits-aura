"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { dateKeyInTimeZone, TZ_COOKIE } from "@/lib/date";

/**
 * Keeps the `tz` cookie in sync with the browser's time zone so the server
 * computes "today" for the user's calendar day. Refreshes data when it changes,
 * and again when the day rolls over while the tab is left open.
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

  // Day rollover: a tab left open past midnight must pick up the new day.
  useEffect(() => {
    let timeZone: string;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }

    let lastKey = dateKeyInTimeZone(new Date(), timeZone);

    const check = () => {
      const key = dateKeyInTimeZone(new Date(), timeZone);
      if (key === lastKey) return;
      lastKey = key;
      queryClient.invalidateQueries();
      router.refresh();
    };

    const interval = setInterval(check, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, [router, queryClient]);

  return null;
}
