"use client";

import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import { IoRocketOutline } from "react-icons/io5";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <IoRocketOutline className="mb-4 h-20 w-20 text-ink" aria-hidden="true" />
      <h2 className="text-2xl font-black tracking-tight text-ink mb-2">
        No habits yet
      </h2>
      <p className="text-graphite mb-6 max-w-sm">
        Start building your daily habits and watch your aura grow!
      </p>
      <Link
        href="/create"
        className="btn btn-primary gap-2 font-extrabold"
        aria-label="Create First Habit"
      >
        <FaPlus />
        Create First Habit
      </Link>
    </div>
  );
}
