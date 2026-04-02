"use client";

import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import { IoRocketOutline } from "react-icons/io5";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <IoRocketOutline className="w-20 h-20 text-gray-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-300 mb-2">
        No habits yet
      </h2>
      <p className="text-gray-500 mb-6 max-w-sm">
        Start building your daily habits and watch your aura grow!
      </p>
      <Link
        href="/create"
        className="btn bg-[#05C26A] text-white gap-2"
        aria-label="Create First Habit"
      >
        <FaPlus />
        Create First Habit
      </Link>
    </div>
  );
}
