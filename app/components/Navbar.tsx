import { DiAtom } from "react-icons/di";
import { FaPlus } from "react-icons/fa6";
import Link from "next/link";
import UserProfile from "./UserProfile";
import type { Session } from "next-auth";

type NavbarProps = {
  user?: Session["user"];
};

export default function Navbar({ user }: NavbarProps) {
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

      <div className="flex-none">
        <UserProfile user={user} />
      </div>
    </nav>
  );
}
