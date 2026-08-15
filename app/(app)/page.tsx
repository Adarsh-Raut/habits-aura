import HabitList from "@/app/components/HabitList";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayWeekdayKey } from "@/lib/date";
import { getHabitsForUser } from "@/lib/habits";

export default async function Page() {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const todayWeekdayKey = getTodayWeekdayKey();
  const habits = await getHabitsForUser(session.user.id);

  return <HabitList initialHabits={habits} todayWeekdayKey={todayWeekdayKey} />;
}