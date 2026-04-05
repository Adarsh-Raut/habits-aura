export default function LoadingLeaderboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {/* Your Rank Card */}
      <div className="bg-neutral rounded-xl p-4">
        <div className="h-4 w-24 bg-base-300 rounded mb-1" />
        <div className="h-10 w-20 bg-base-300 rounded" />
        <div className="h-4 w-32 bg-base-300 rounded mt-2" />
      </div>

      {/* Leaderboard - spans 2 columns */}
      <div className="md:col-span-2 bg-neutral rounded-xl shadow p-4 sm:p-6">
        {/* Title */}
        <div className="h-7 w-32 bg-base-300 rounded mb-4" />

        {/* Pagination */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-4 w-28 bg-base-300 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-14 h-8 bg-base-300 rounded" />
            <div className="h-4 w-14 bg-base-300 rounded" />
            <div className="w-14 h-8 bg-base-300 rounded" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* Headers */}
            <thead className="text-xs sm:text-sm">
              <tr>
                <th>
                  <div className="h-4 w-8 bg-base-300 rounded" />
                </th>
                <th>
                  <div className="h-4 w-20 bg-base-300 rounded" />
                </th>
                <th>
                  <div className="h-4 w-24 bg-base-300 rounded" />
                </th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="w-6 h-6 bg-base-300 rounded-full" />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-base-300 rounded-full" />
                      <div className="h-4 w-24 bg-base-300 rounded" />
                    </div>
                  </td>
                  <td>
                    <div className="h-4 w-14 bg-base-300 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
