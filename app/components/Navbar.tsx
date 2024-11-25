import { GoGear } from "react-icons/go";

import { DiAtom } from "react-icons/di";
import { FaPlus } from "react-icons/fa6";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="navbar bg-base-100">
      <div className="flex-1 px-4">
        <DiAtom className="h-10 w-10" />
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Habits
        </Link>
        <Link href="/create" className="btn btn-ghost">
          <FaPlus className="h-5 w-5" />
        </Link>
      </div>
      <div className="flex-none">
        <button className="btn btn-ghost">
          <GoGear className="h-5 w-5 stroke-1" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
