type Props = {
  calendar: Record<string, number>;
  createdAt: string;
};

function getDateKey(date: Date) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

export default function HabitHeatmap({ calendar, createdAt }: Props) {
  const completedDays = new Set(Object.keys(calendar));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(createdAt);
  startDate.setHours(0, 0, 0, 0);

  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    currentWeek.push(new Date(d));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-xs text-gray-400">
        {weeks.map((week, i) => {
          const month = week[0].toLocaleString("default", { month: "short" });
          const prev =
            i > 0
              ? weeks[i - 1][0].toLocaleString("default", { month: "short" })
              : null;

          return (
            <div key={i} className="w-4 text-center">
              {month !== prev ? month : ""}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date, di) => {
              const key = getDateKey(date);
              const isCompleted = completedDays.has(key);

              return (
                <div
                  key={di}
                  title={key}
                  className={`w-4 h-4 rounded-sm ${
                    isCompleted ? "bg-green-500" : "bg-gray-700"
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
