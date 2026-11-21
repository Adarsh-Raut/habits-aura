"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const SEED_EMAILS = [
  "alex", "sam", "jordan", "casey", "morgan", "taylor", "riley",
  "avery", "quinn", "harper", "dakota", "emerson", "rowan", "sky",
].map((name) => `${name}@example.com`);

/**
 * Local-only quick login. Needs NEXT_PUBLIC_DEV_LOGIN=1 and never renders in a
 * production build (NODE_ENV is inlined, so this is dead code there).
 */
export default function DevLogin() {
  const [email, setEmail] = useState(SEED_EMAILS[0]);

  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DEV_LOGIN !== "1"
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-2 right-2 z-50 flex max-w-[calc(100vw-1rem)] items-center gap-2 rounded-xl border border-dashed border-yellow-500/60 bg-black/70 p-3 text-sm text-gray-200">
      <label htmlFor="dev-login-user" className="sr-only text-yellow-400 sm:not-sr-only">
        Dev login
      </label>
      <select
        id="dev-login-user"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="select select-bordered select-sm bg-white text-ink"
      >
        {SEED_EMAILS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => signIn("dev-login", { email, callbackUrl: "/" })}
        className="btn btn-sm btn-warning"
      >
        Sign in
      </button>
    </div>
  );
}
