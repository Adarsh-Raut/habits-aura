export default function HabitSkeleton() {
  return (
    <div className="bg-neutral rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between">
        {/* Left side: Menu + Title + Streak/Fallback */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Menu button - matches btn-ghost btn-sm btn-circle */}
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-5 h-5 bg-base-300 rounded-full" />
          </div>

          <div className="flex items-center gap-2">
            {/* Title - matches font-semibold text-base sm:text-lg */}
            <div className="h-5 w-32 bg-base-300 rounded" />
          </div>
        </div>

        {/* Toggle button - matches w-10 h-10 rounded-md border-2 */}
        <div className="w-10 h-10 bg-base-300 rounded-md border-2 border-gray-700" />
      </div>
    </div>
  );
}
