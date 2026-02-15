export default function LoadingLeaderboard() {
  return (
    <div className="bg-neutral rounded-xl p-6 animate-pulse">
      <div className="h-6 w-40 bg-base-300 rounded mb-4" />

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-8 h-8 bg-base-300 rounded-full" />
            <div className="flex-1 h-4 bg-base-300 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
