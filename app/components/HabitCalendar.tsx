type Props = {
  calendar: Record<string, number>;
};

export default function HabitCalendar({ calendar }: Props) {
  const days = Object.entries(calendar);

  return (
    <div className="grid grid-cols-7 gap-1 max-w-md">
      {days.map(([date, count]) => {
        let color = "bg-gray-700";
        if (count >= 3) color = "bg-green-600";
        else if (count === 2) color = "bg-green-500";
        else if (count === 1) color = "bg-green-400";

        return (
          <div
            key={date}
            title={`${date}: ${count} habits`}
            className={`w-4 h-4 rounded ${color}`}
          />
        );
      })}
    </div>
  );
}
