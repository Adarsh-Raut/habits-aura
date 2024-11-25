"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegCheckSquare } from "react-icons/fa";
import { GoTrophy } from "react-icons/go";
export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "HABITS",
      icon: FaRegCheckSquare,
      path: "/",
      isActive: true,
    },
    {
      name: "LEADERBOARD",
      icon: GoTrophy,
      path: "/leaderboard",
      isActive: false,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#1E2330] p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              ${
                item.isActive
                  ? "text-gray-200 hover:bg-gray-700/50"
                  : "text-gray-500 hover:bg-gray-700/30"
              }
              transition-colors
            `}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-medium tracking-wide">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
