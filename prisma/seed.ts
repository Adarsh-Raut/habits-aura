import { PrismaClient } from "@prisma/client";

import {
  addDaysToKey,
  dateKeyToDate,
  type DayKey,
  getTodayDateKey,
  resolveTimeZone,
  weekdayKeyOfDateKey,
} from "../lib/date";
import { auraForCounts, STARTING_AURA } from "../lib/aura";

const prisma = new PrismaClient();
const TIME_ZONE = resolveTimeZone(process.env.SEED_TIME_ZONE);

const HABIT_TEMPLATES: { title: string; days: DayKey[]; completionRate: number }[] = [
  { title: "Morning Workout", days: ["MON", "TUE", "WED", "THU", "FRI"], completionRate: 0.8 },
  { title: "Read 30 mins", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.9 },
  { title: "Meditate", days: ["SAT", "SUN"], completionRate: 0.5 },
  { title: "Evening Walk", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.7 },
  { title: "No Screens Before Bed", days: ["MON", "WED", "FRI"], completionRate: 0.6 },
  { title: "Drink 2L Water", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.75 },
];

/** `consistency` scales every habit's completion rate so users differ. */
const SEED_USERS = [
  { name: "Alex Johnson", email: "alex@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Alex", consistency: 1.15 },
  { name: "Sam Williams", email: "sam@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Sam", consistency: 1.0 },
  { name: "Jordan Lee", email: "jordan@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Jordan", consistency: 0.7 },
  { name: "Casey Brown", email: "casey@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Casey", consistency: 1.1 },
  { name: "Morgan Davis", email: "morgan@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Morgan", consistency: 0.95 },
  { name: "Taylor Miller", email: "taylor@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Taylor", consistency: 0.55 },
  { name: "Riley Chen", email: "riley@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Riley", consistency: 1.05 },
  { name: "Avery Patel", email: "avery@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Avery", consistency: 0.85 },
  { name: "Quinn Nguyen", email: "quinn@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Quinn", consistency: 0.4 },
  { name: "Harper Kim", email: "harper@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Harper", consistency: 1.2 },
  { name: "Dakota Singh", email: "dakota@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Dakota", consistency: 0.75 },
  { name: "Emerson Lopez", email: "emerson@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Emerson", consistency: 0.6 },
  { name: "Rowan Garcia", email: "rowan@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Rowan", consistency: 0.9 },
  { name: "Sky Martin", email: "sky@example.com", image: "https://api.dicebear.com/7.x/avataaars/png?seed=Sky", consistency: 0.3 },
];

const HISTORY_DAYS = 90;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomCompletion(rate: number): "COMPLETED" | "SKIPPED" | null {
  const rand = Math.random();
  if (rand < rate) {
    return "COMPLETED";
  } else if (rand < rate + 0.2) {
    return "SKIPPED";
  }
  return null;
}

function generateDateKeys(days: number): string[] {
  const today = getTodayDateKey(TIME_ZONE);
  const dateKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) dateKeys.push(addDaysToKey(today, -i));
  return dateKeys;
}

async function seed() {
  console.log("🌱 Starting seed...");
  console.log("ℹ️  This will add seed users WITHOUT clearing existing data");

  // Check for existing users to see if this is first run
  const existingUsers = await prisma.user.count();
  console.log(`📊 Existing users in database: ${existingUsers}`);

  if (process.argv.includes("--reset")) {
    const removed = await prisma.user.deleteMany({
      where: { email: { endsWith: "@example.com" } },
    });
    console.log(`🧹 Removed ${removed.count} existing @example.com seed users`);
  }

  // Create seed users (skip if already exists)
  console.log("👤 Creating seed users...");
  const createdUsers: { id: string; consistency: number }[] = [];
  
  for (const userData of SEED_USERS) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      // Update existing seed user's avatar to PNG format
      const updatedUser = await prisma.user.update({
        where: { email: userData.email },
        data: { image: userData.image },
      });
      console.log(`   - ${userData.email} already exists, updated avatar to PNG`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        image: userData.image,
        auraPoints: STARTING_AURA,
      },
    });
    createdUsers.push({ id: user.id, consistency: userData.consistency });
    console.log(`   - Created: ${userData.email}`);
  }

  if (createdUsers.length === 0) {
    console.log("ℹ️  All seed users already exist. Run with --force to recreate.");
  } else {
    console.log(`✅ Created ${createdUsers.length} new users`);
  }

  // Create habits and completions for seed users ONLY
  for (const user of createdUsers) {
    // Shuffle habit templates and pick 5-6
    const shuffled = [...HABIT_TEMPLATES].sort(() => Math.random() - 0.5);
    const userHabits = shuffled.slice(0, randomInt(5, 6));

    for (const template of userHabits) {
      // Create habit first (with default streaks)
      const habit = await prisma.habit.create({
        data: {
          title: template.title,
          days: template.days,
          userId: user.id,
          createdAt: dateKeyToDate(
            addDaysToKey(getTodayDateKey(TIME_ZONE), -(HISTORY_DAYS - 1)),
          ),
        },
      });

      const dateKeys = generateDateKeys(HISTORY_DAYS);
      const completedDateKeys: string[] = [];
      const skippedDateKeys: string[] = [];

      // Generate completions with correct habitId
      for (const dateKey of dateKeys) {
        const dayKey = weekdayKeyOfDateKey(dateKey);

        // Only create completion if it's a habit day
        if (template.days.includes(dayKey)) {
          const action = getRandomCompletion(
            Math.min(0.97, template.completionRate * user.consistency),
          );
          if (action) {
            await prisma.habitCompletion.create({
              data: {
                habitId: habit.id,
                dateKey,
                action,
              },
            });

            if (action === "COMPLETED") {
              completedDateKeys.push(dateKey);
            } else if (action === "SKIPPED") {
              skippedDateKeys.push(dateKey);
            }
          }
        }
      }

      // Update user aura points
      const auraChange = auraForCounts(completedDateKeys.length, skippedDateKeys.length);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          auraPoints: {
            increment: auraChange,
          },
        },
      });
    }
  }

  // Final summary
  const totalUsers = await prisma.user.count();
  const totalHabits = await prisma.habit.count();
  const totalCompletions = await prisma.habitCompletion.count();

  console.log("");
  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("📊 Database Summary:");
  console.log(`   - Total Users: ${totalUsers}`);
  console.log(`   - Total Habits: ${totalHabits}`);
  console.log(`   - Total Completions: ${totalCompletions}`);
  console.log("");
  console.log("🔑 Seed Test Accounts (for leaderboard):");
  for (const user of SEED_USERS) {
    console.log(`   - ${user.email}`);
  }
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
