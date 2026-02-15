"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegCheckSquare } from "react-icons/fa";
import { GoTrophy } from "react-icons/go";
import { IoStatsChart } from "react-icons/io5";

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/signin") {
    return null;
  }

  const closeDrawer = () => {
    const drawer = document.getElementById(
      "sidebar-drawer",
    ) as HTMLInputElement | null;

    if (drawer) drawer.checked = false;
  };

  const menuItems = [
    { name: "HABITS", icon: FaRegCheckSquare, path: "/" },
    { name: "LEADERBOARD", icon: GoTrophy, path: "/leaderboard" },
    { name: "STATS", icon: IoStatsChart, path: "/stats" },
  ];

  return (
    <aside className="w-64 h-full bg-[#1E2330] p-4 flex flex-col">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            onClick={closeDrawer}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              ${
                pathname === item.path
                  ? "text-gray-200 bg-gray-700/50"
                  : "text-gray-500 hover:bg-gray-700/30"
              }
              transition-colors
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium tracking-wide">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
