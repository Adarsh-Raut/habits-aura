"use client";

import { GoGear } from "react-icons/go";
import { DiAtom } from "react-icons/di";
import { FaPlus } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const { data: session } = useSession();

  if (pathname === "/signin") {
    return null;
  }

  return (
    <nav className="navbar px-2 sm:px-4 relative z-50">
      <div className="flex-1 items-center gap-1 sm:gap-2">
        <label htmlFor="sidebar-drawer" className="btn btn-ghost lg:hidden">
          ☰
        </label>

        <Link
          href="/"
          className="flex items-center gap-2 btn btn-ghost normal-case px-2"
        >
          <DiAtom className="h-8 w-8 sm:h-10 sm:w-10" />
          <span className="hidden sm:inline text-xl">Habits</span>
        </Link>

        <Link href="/create" className="btn btn-ghost">
          <FaPlus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">New</span>
        </Link>
      </div>

      {session?.user && (
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost gap-2 px-2 sm:px-3 normal-case"
            >
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={session.user.image ?? ""}
                    alt={session.user.name ?? "User avatar"}
                    referrerPolicy="no-referrer"
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
              className="dropdown-content menu bg-base-200 border border-base-300 rounded-xl w-48 p-2 shadow-xl z-50"
            >
              <li className="pointer-events-none">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{session.user.name}</span>
                  <span className="text-xs opacity-60">
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
