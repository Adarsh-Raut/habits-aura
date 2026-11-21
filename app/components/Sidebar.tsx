"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegCheckSquare } from "react-icons/fa";
import { GoTrophy } from "react-icons/go";
import { IoStatsChart } from "react-icons/io5";

const menuItems = [
  { name: "HABITS", label: "Habits", icon: FaRegCheckSquare, path: "/" },
  { name: "LEADERBOARD", label: "Leaderboard", icon: GoTrophy, path: "/leaderboard" },
  { name: "STATS", label: "Stats", icon: IoStatsChart, path: "/stats" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const closeDrawer = () => {
    const drawer = document.getElementById(
      "sidebar-drawer",
    ) as HTMLInputElement | null;

    if (drawer) drawer.checked = false;
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-ash bg-base-100 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            onClick={closeDrawer}
            className={`
              flex min-h-12 items-center gap-3 rounded-xl px-4 py-3
              ${
                pathname === item.path
                  ? "bg-ink text-paper"
                  : "text-graphite hover:bg-ash/60 hover:text-ink"
              }
              transition-colors
            `}
            aria-current={pathname === item.path ? "page" : undefined}
          >
            <item.icon
              className={`h-5 w-5 ${pathname === item.path ? "text-signal" : ""}`}
              aria-hidden="true"
            />
            <span className="font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
