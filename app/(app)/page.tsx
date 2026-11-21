import HabitList from "@/app/components/HabitList";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodayWeekdayKey } from "@/lib/date";
import { getHabitsForUser } from "@/lib/habits";
import { getUserTimeZone } from "@/lib/timezone";

export default async function Page() {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const timeZone = getUserTimeZone();
  const todayWeekdayKey = getTodayWeekdayKey(timeZone);
  const habits = await getHabitsForUser(session.user.id, timeZone);

  return <HabitList initialHabits={habits} todayWeekdayKey={todayWeekdayKey} />;
}