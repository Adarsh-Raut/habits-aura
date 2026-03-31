import CreateHabitForm from "@/app/components/CreateHabitForm";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function EditHabitPage({
  params,
}: {
  params: { id: string };
}) {
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
      habitId={habit.id}
      initialTitle={habit.title}
      initialDays={habit.days}
    />
  );
}
