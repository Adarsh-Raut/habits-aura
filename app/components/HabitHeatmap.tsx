"use client";

import { memo, useMemo } from "react";

type Props = {
  calendar: Record<string, number>;
  windowStart: string;
  todayKey: string;
};

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const HabitHeatmap = memo(function HabitHeatmap({
  calendar,
  windowStart,
  todayKey,
}: Props) {
  const completedDays = useMemo(() => new Set(Object.keys(calendar)), [calendar]);
  const weeks = useMemo(() => {
    const today = parseDateKey(todayKey);
    const startDate = new Date(windowStart);
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());

    const nextWeeks: Date[][] = [];
    let currentWeek: Date[] = [];

    for (
      let d = new Date(startDate);
      d <= today;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      currentWeek.push(new Date(d));

      if (currentWeek.length === 7) {
        nextWeeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length) {
      nextWeeks.push(currentWeek);
    }

    return nextWeeks;
  }, [todayKey, windowStart]);

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-xs text-gray-400">
        {weeks.map((week, i) => {
          const month = monthFormatter.format(week[0]);
          const prev =
            i > 0 ? monthFormatter.format(weeks[i - 1][0]) : null;

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
              const formattedDate = fullDateFormatter.format(date);

              return (
                <div
                  key={di}
                  className="tooltip tooltip-top custom-tooltip"
                  data-tip={formattedDate}
                >
                  <div
                    className={`w-4 h-4 rounded-sm ${
                      isCompleted ? "bg-green-500" : "bg-gray-700"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

export default HabitHeatmap;
