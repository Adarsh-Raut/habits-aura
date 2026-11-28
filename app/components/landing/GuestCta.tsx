"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const variants = {
  header: "min-h-11 px-3 text-sm bg-signal text-ink hover:bg-signal-hover",
  primary: "min-h-[54px] px-7 bg-signal text-ink hover:bg-signal-hover",
  dark: "min-h-11 border-2 px-5 border-paper text-paper hover:bg-paper hover:text-ink",
};

export default function GuestCta({ variant = "primary" }: { variant?: keyof typeof variants }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function startDemo() {
    setPending(true);
    setError("");
    try {
      const result = await signIn("guest", {
        redirect: false,
        callbackUrl: "/",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (result?.ok && result.url && !result.error) {
        window.location.assign(result.url);
        return;
      }
    } catch {
      // The same retry message covers network and capacity failures.
    }
    setError("The demo is busy right now. Please try again later.");
    setPending(false);
  }

  return (
    <div data-guest-cta className="relative">
      <button
        type="button"
        disabled={pending}
        onClick={startDemo}
        className={`whitespace-nowrap rounded-xl py-2 font-extrabold disabled:opacity-60 ${variants[variant]}`}
      >
        {pending ? "Starting demo…" : "Try the demo"}
      </button>
      {error && (
        <p
          className={variant === "header"
            ? "absolute right-0 top-full mt-2 w-52 rounded-lg border border-ash bg-paper p-2 text-sm text-ink shadow"
            : "mt-2 text-sm"}
          role="status"
        >
          {error}
        </p>
      )}
    </div>
  );
}
