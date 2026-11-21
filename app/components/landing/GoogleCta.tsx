"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

type Props = {
  label?: string;
  size?: "md" | "lg";
  variant?: "primary" | "ghost";
  showIcon?: boolean;
  className?: string;
};

/** The one sign-in action used everywhere on the landing page. */
export default function GoogleCta({
  label = "Continue with Google",
  size = "lg",
  variant = "primary",
  showIcon = true,
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false);

  const sizing = size === "lg" ? "h-12 px-6 text-base" : "h-10 px-4 text-sm";
  const look =
    variant === "primary"
      ? "bg-done text-ink-950 hover:bg-[#3ddc78] focus-visible:outline-done"
      : "border border-ink-600 text-mist-100 hover:bg-ink-800 focus-visible:outline-mist-300";

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl: "/", prompt: "select_account" });
      }}
      className={`inline-flex items-center justify-center gap-2.5 rounded-lg font-semibold transition-transform duration-150 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${sizing} ${look} ${className}`}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
          aria-hidden="true"
        />
      ) : (
        showIcon && <FaGoogle className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{loading ? "Redirecting…" : label}</span>
    </button>
  );
}
