"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { resetGuestDemo } from "@/app/guest-actions";

export default function GuestBanner({ expiresAt }: { expiresAt: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => router.refresh(), Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [expiresAt, router]);

  async function reset() {
    setPending(true);
    setError("");
    try {
      const result = await resetGuestDemo();
      if (result.ok) {
        window.location.assign("/");
        return;
      }
      setError(result.error);
    } catch {
      setError("Could not reset the demo. Please try again.");
    }
    setPending(false);
  }

  return (
    <section aria-label="Guest demo" className="mb-5 rounded-2xl border border-ash bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <div>
          <p className="font-bold">You’re in a demo</p>
          <p className="text-sm text-graphite">This workspace expires after 24 hours. Signing in starts a separate workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3">
          <button type="button" className="min-h-11 text-sm font-bold underline" disabled={pending} onClick={reset}>
            {pending ? "Resetting…" : "Reset demo"}
          </button>
          <button type="button" className="min-h-11 text-sm font-bold text-signal-text underline" onClick={async () => {
            try {
              await signIn("google", { callbackUrl: "/" });
            } catch {
              setError("Could not start Google sign-in. Please try again.");
            }
          }}>
            Continue with Google
          </button>
        </div>
      </div>
      {error && <p role="status" className="text-sm text-signal-text">{error}</p>}
    </section>
  );
}
