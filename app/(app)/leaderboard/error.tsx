"use client";

import { useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <h2 className="text-2xl font-bold text-error mb-2">
        Leaderboard unavailable
      </h2>
      <p className="text-gray-400 mb-4">
        We could not load the leaderboard.
      </p>
      <button
        onClick={() => reset()}
        className="btn btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
