export default function HabitSkeleton() {
  return (
    <div className="bg-neutral rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-base-300 rounded-full" />
          <div className="h-4 w-36 bg-base-300 rounded" />
        </div>
        <div className="w-10 h-10 bg-base-300 rounded-md" />
      </div>
    </div>
  );
}
