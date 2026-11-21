"use client";

import { useEffect, useRef, useState } from "react";
import { GoGear } from "react-icons/go";
import type { Session } from "next-auth";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";

type UserProfileProps = {
  user?: Session["user"];
};

/**
 * Account menu: a disclosure button that toggles on every click, closes on an
 * outside click or Escape, and reports its state to assistive tech.
 * (The previous DaisyUI focus-based dropdown stayed open while the trigger
 * kept focus, so a second click never closed it.)
 */
export default function UserProfile({ user }: UserProfileProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? "user-menu" : undefined}
        aria-label="Account menu"
        className="btn btn-ghost min-h-11 gap-2 px-2 normal-case sm:px-3"
      >
        <Avatar src={user.image} name={user.name ?? "User"} size={32} />

        <span className="hidden font-medium md:inline">{user.name}</span>

        <GoGear className="h-4 w-4 opacity-70 sm:h-5 sm:w-5" aria-hidden="true" />
      </button>

      {open && (
        <ul
          id="user-menu"
          className="menu absolute right-0 top-full z-50 mt-2 w-52 max-w-[90vw] overflow-hidden rounded-xl border border-ash bg-white p-2 shadow-xl sm:w-56"
        >
          <li className="pointer-events-none">
            <div className="flex max-w-full flex-col gap-0.5">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-graphite">
                {user.email}
              </span>
            </div>
          </li>

          <li className="divider my-1" />

          <li>
            <LogoutButton />
          </li>
        </ul>
      )}
    </div>
  );
}
