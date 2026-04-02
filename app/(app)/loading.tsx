import HabitSkeleton from "@/app/components/HabitSkeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <HabitSkeleton key={i} />
      ))}
    </div>
  );
}
