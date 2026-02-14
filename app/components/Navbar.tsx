"use client";

import { GoGear } from "react-icons/go";
import { DiAtom } from "react-icons/di";
import { FaPlus } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="navbar bg-base-100">
      {/* LEFT */}
      <div className="flex-1 px-4">
        <DiAtom className="h-10 w-10" />

        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Habits
        </Link>

        <Link href="/create" className="btn btn-ghost">
          <FaPlus className="h-5 w-5" />
        </Link>
      </div>

      {/* RIGHT */}
      {session?.user && (
        <div className="flex-none px-4">
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost gap-2 px-2 normal-case"
            >
              {/* Avatar */}
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={session.user.image ?? ""}
                    alt={session.user.name ?? "User avatar"}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Name */}
              <span className="hidden sm:inline font-medium">
                {session.user.name}
              </span>

              {/* Gear */}
              <GoGear className="h-5 w-5 opacity-70" />
            </label>

            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 border border-base-300 rounded-xl w-48 p-2 shadow-x hover:bg-base-300"
            >
              {/* User info */}
              <li className="pointer-events-none">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-base-content">
                    {session.user.name}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {session.user.email}
                  </span>
                </div>
              </li>

              <li className="divider my-1" />

              {/* Logout */}
              <li>
                <button
                  onClick={() =>
                    signOut({
                      callbackUrl: "/signin",
                    })
                  }
                  className="text-error flex items-center gap-2"
                >
                  <MdLogout className="h-4 w-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
