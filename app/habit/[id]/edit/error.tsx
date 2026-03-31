"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h2 className="text-2xl font-bold text-error mb-2">
        Something went wrong!
      </h2>
      <p className="text-gray-400 mb-4">
        We could not load the edit page.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="btn btn-primary"
        >
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Go Home
        </Link>
      </div>
    </div>
  );
}
