import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import dynamic from "next/dynamic";

const CreateHabitForm = dynamic(
  () => import("@/app/components/CreateHabitForm"),
  {
    loading: () => (
      <div className="min-h-screen px-3 py-6 sm:p-6">
        <div className="max-w-md mx-auto">
          {/* Back button */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-base-300 rounded" />
            <div className="h-5 w-14 bg-base-300 rounded" />
          </div>

          <div className="card bg-neutral shadow-xl p-5 sm:p-6 space-y-6">
            {/* Title label */}
            <div>
              <div className="h-6 w-24 bg-base-300 rounded mb-2" />
              <div className="h-12 bg-base-300 rounded" />
            </div>

            {/* Days label */}
            <div>
              <div className="h-5 w-12 bg-base-300 rounded mb-3" />
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-base-300 rounded-sm" />
                    <div className="h-3 w-3 bg-base-300 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <div className="h-12 bg-base-300 rounded" />
          </div>
        </div>
      </div>
    ),
  }
);

export default async function EditHabitPage({
  params,
}: {
  params: { id: string };
}) {
  noStore();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const habit = await prisma.habit.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      days: true,
      userId: true,
    },
  });

  if (!habit || habit.userId !== session.user.id) {
    notFound();
  }

  return (
    <CreateHabitForm
      key={habit.id}
      habitId={habit.id}
      initialTitle={habit.title}
      initialDays={habit.days}
    />
  );
}
