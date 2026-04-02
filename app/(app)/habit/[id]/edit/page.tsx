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
          <div className="skeleton h-10 w-20 mb-4" />
          <div className="card bg-neutral shadow-xl p-5 sm:p-6 space-y-6">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-12 w-full" />
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
