"use client";

import { GoGear } from "react-icons/go";
import { MdLogout } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="skeleton w-10 h-10 rounded-full" />
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost gap-2 px-2 sm:px-3 normal-case"
      >
        <div className="avatar">
          <div className="w-8 rounded-full relative overflow-hidden">
            <Image
              src={session.user.image ?? ""}
              alt={session.user.name ?? "User avatar"}
              referrerPolicy="no-referrer"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <span className="hidden md:inline font-medium">
          {session.user.name}
        </span>

        <GoGear className="h-4 w-4 sm:h-5 sm:w-5 opacity-70" />
      </label>

      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 border border-base-300 rounded-xl w-52 sm:w-56 p-2 shadow-xl z-50 max-w-[90vw] overflow-hidden"
      >
        <li className="pointer-events-none">
          <div className="flex flex-col gap-0.5 max-w-full">
            <span className="font-semibold truncate">
              {session.user.name}
            </span>
            <span className="text-xs opacity-60 truncate">
              {session.user.email}
            </span>
          </div>
        </li>

        <li className="divider my-1" />

        <li>
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
        </li>
      </ul>
    </div>
  );
}
