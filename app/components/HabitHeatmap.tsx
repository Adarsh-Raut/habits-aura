"use client";

import { memo, useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import type { Activity } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";

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

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

// Empty -> full, in the brand's signal orange.
const SIGNAL_SCALE = ["#ecece7", "#ffd9cc", "#ffb199", "#ff7a50", "#ff4d1a"];

// Module-level so the object identity is stable across renders.
const HEATMAP_THEME = { light: SIGNAL_SCALE, dark: SIGNAL_SCALE };

const HabitHeatmap = memo(function HabitHeatmap({
  calendar,
  windowStart,
  todayKey,
}: Props) {
  const completedCount = Object.keys(calendar).length;

  const data = useMemo(() => {
    const start = new Date(windowStart);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());

    const byDate = new Map<string, Activity>();
    byDate.set(getDateKey(start), { date: getDateKey(start), count: 0, level: 0 });
    byDate.set(todayKey, { date: todayKey, count: 0, level: 0 });

    Object.keys(calendar)
      .sort()
      .forEach((date) => {
        byDate.set(date, { date, count: 1, level: 4 });
      });

    return Array.from(byDate.values()).sort((a, b) =>
      a.date < b.date ? -1 : 1,
    );
  }, [calendar, windowStart, todayKey]);

  return (
    <ActivityCalendar
      data={data}
      theme={HEATMAP_THEME}
      colorScheme="light"
      weekStart={0}
      showWeekdayLabels={["mon", "wed", "fri"]}
      blockSize={12}
      blockMargin={3}
      blockRadius={2}
      fontSize={12}
      showColorLegend={false}
      labels={{
        totalCount: `{{count}} ${completedCount === 1 ? "day" : "days"} completed`,
      }}
      tooltips={{
        activity: {
          text: (activity) => {
            const label = fullDateFormatter.format(parseDateKey(activity.date));
            return activity.count > 0
              ? `Completed on ${label}`
              : `No activity on ${label}`;
          },
        },
      }}
    />
  );
});

export default HabitHeatmap;