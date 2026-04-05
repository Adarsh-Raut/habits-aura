export default function Loading() {
  return (
    <div className="space-y-6 text-gray-200">
      {/* Selector */}
      <div className="bg-neutral rounded-xl p-4 max-w-xl">
        <div className="h-4 w-24 bg-base-300 rounded mb-2" />
        <div className="h-10 w-full bg-base-300 rounded" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Streak card */}
        <div className="bg-neutral rounded-xl p-4">
          <div className="h-4 w-28 bg-base-300 rounded mb-2" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-base-300 rounded" />
            <div className="h-8 w-12 bg-base-300 rounded mb-1" />
          </div>
          <div className="h-4 w-20 bg-base-300 rounded" />
        </div>

        {/* Longest Streak card */}
        <div className="bg-neutral rounded-xl p-4">
          <div className="h-4 w-28 bg-base-300 rounded mb-2" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-base-300 rounded" />
            <div className="h-8 w-12 bg-base-300 rounded mb-1" />
          </div>
          <div className="h-4 w-24 bg-base-300 rounded" />
        </div>
      </div>

      {/* Heatmap section - title only, actual skeleton shown in component */}
      <div className="bg-neutral rounded-xl p-4">
        <div className="h-6 w-40 bg-base-300 rounded mb-1" />
        <div className="h-4 w-32 bg-base-300 rounded mb-4" />
        <div className="h-48 w-full bg-base-300 rounded-lg" />
      </div>
    </div>
  );
}
