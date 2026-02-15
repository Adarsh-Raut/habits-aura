import StatsView from "../components/StatsView";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return <StatsView habits={habits} />;
}
