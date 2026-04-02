export default function Loading() {
  return (
    <div className="space-y-6 text-gray-200">
      {/* Selector */}
      <div className="bg-neutral rounded-xl p-4 max-w-xl">
        <div className="skeleton h-4 w-24 mb-2" />
        <div className="skeleton h-10 w-full" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Streak card */}
        <div className="bg-neutral rounded-xl p-4">
          <div className="skeleton h-4 w-28 mb-2" />
          <div className="skeleton h-8 w-16 mb-1" />
          <div className="skeleton h-4 w-20" />
        </div>

        {/* Longest Streak card */}
        <div className="bg-neutral rounded-xl p-4">
          <div className="skeleton h-4 w-28 mb-2" />
          <div className="skeleton h-8 w-16 mb-1" />
          <div className="skeleton h-4 w-24" />
        </div>
      </div>

      {/* Heatmap section */}
      <div className="bg-neutral rounded-xl p-4">
        <div className="skeleton h-6 w-40 mb-1" />
        <div className="skeleton h-4 w-32 mb-4" />
        <div className="skeleton h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}
