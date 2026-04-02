"use client";

import { MdLogout } from "react-icons/md";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() =>
        signOut({
          callbackUrl: "/signin",
        })
      }
      className="text-error flex items-center gap-2 w-full"
      aria-label="Logout"
    >
      <MdLogout className="h-4 w-4 shrink-0" />
      <span className="truncate">Logout</span>
    </button>
  );
}
