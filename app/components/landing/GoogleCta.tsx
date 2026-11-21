"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Props = {
  label?: string;
  size?: "md" | "lg" | "xl";
  variant?: "signal" | "ghost" | "link";
  className?: string;
};

/** The one sign-in action used everywhere on the landing page. */
export default function GoogleCta({
  label = "Continue with Google",
  size = "lg",
  variant = "signal",
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false);

  const sizing =
    size === "xl"
      ? "h-[58px] px-8 text-[17px]"
      : size === "lg"
        ? "h-[54px] px-7 text-base"
        : "h-11 px-5 text-sm";

  const look =
    variant === "signal"
      ? "bg-signal text-ink hover:bg-signal-hover"
      : variant === "ghost"
        ? "border-2 border-ink text-ink hover:bg-ink hover:text-paper"
        : "text-ink hover:text-signal-text";

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl: "/", prompt: "select_account" });
      }}
      className={`inline-flex items-center justify-center rounded-xl font-extrabold transition duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variant === "link" ? "h-11 px-2 text-[15px]" : sizing} ${look} ${className}`}
    >
      {loading ? "Redirecting…" : label}
    </button>
  );
}
