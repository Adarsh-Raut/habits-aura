import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const HABIT_TEMPLATES = [
  { title: "Morning Workout", days: ["MON", "TUE", "WED", "THU", "FRI"], completionRate: 0.8 },
  { title: "Read 30 mins", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.9 },
  { title: "Meditate", days: ["SAT", "SUN"], completionRate: 0.5 },
  { title: "Evening Walk", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.7 },
  { title: "No Screens Before Bed", days: ["MON", "WED", "FRI"], completionRate: 0.6 },
  { title: "Drink 2L Water", days: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], completionRate: 0.75 },
];

const SEED_USERS = [
  { name: "Alex Johnson", email: "alex@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", auraPoints: 250 },
  { name: "Sam Williams", email: "sam@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam", auraPoints: 180 },
  { name: "Jordan Lee", email: "jordan@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan", auraPoints: 120 },
  { name: "Casey Brown", email: "casey@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey", auraPoints: 220 },
  { name: "Morgan Davis", email: "morgan@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan", auraPoints: 160 },
  { name: "Taylor Miller", email: "taylor@example.com", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor", auraPoints: 95 },
];

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
  const dateKeys: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dateKeys.push(date.toISOString().split("T")[0]);
  }

  return dateKeys;
}

async function seed() {
  console.log("🌱 Starting seed...");
  console.log("ℹ️  This will add seed users WITHOUT clearing existing data");

  // Check for existing users to see if this is first run
  const existingUsers = await prisma.user.count();
  console.log(`📊 Existing users in database: ${existingUsers}`);

  // Create seed users (skip if already exists)
  console.log("👤 Creating seed users...");
  const createdUsers = [];
  
  for (const userData of SEED_USERS) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`   - ${userData.email} already exists, skipping`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        image: userData.image,
        auraPoints: userData.auraPoints,
      },
    });
    createdUsers.push(user);
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
          currentStreak: 0,
          longestStreak: 0,
        },
      });

      const dateKeys = generateDateKeys(30);
      const completedDateKeys: string[] = [];
      const skippedDateKeys: string[] = [];

      // Generate completions with correct habitId
      for (const dateKey of dateKeys) {
        const date = new Date(dateKey);
        const dayKey = DAY_KEYS[date.getDay()];

        // Only create completion if it's a habit day
        if (template.days.includes(dayKey)) {
          const action = getRandomCompletion(template.completionRate);
          if (action) {
            await prisma.habitCompletion.create({
              data: {
                habitId: habit.id,
                date: new Date(dateKey),
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

      // Calculate streaks
      const completedSet = new Set(completedDateKeys);
      const habitDaySet = new Set(template.days);
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate current streak
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = DAY_KEYS[date.getDay()];
        const dateKey = date.toISOString().split("T")[0];

        if (habitDaySet.has(dayKey)) {
          if (completedSet.has(dateKey)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      const sortedDates = Array.from(completedSet).sort();
      tempStreak = 0;
      
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const currentDay = DAY_KEYS[currentDate.getDay()];
        
        if (!habitDaySet.has(currentDay)) continue;
        
        if (i === 0) {
          tempStreak = 1;
        } else {
          let foundPrev = false;
          for (let d = 1; d <= 7; d++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(checkDate.getDate() - d);
            if (habitDaySet.has(DAY_KEYS[checkDate.getDay()]) && completedSet.has(checkDate.toISOString().split("T")[0])) {
              tempStreak++;
              foundPrev = true;
              break;
            }
          }
          
          if (!foundPrev) {
            tempStreak = 1;
          }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      // Update habit with calculated streaks
      await prisma.habit.update({
        where: { id: habit.id },
        data: {
          currentStreak,
          longestStreak,
        },
      });

      // Update user aura points
      const auraChange = completedDateKeys.length * 10 - skippedDateKeys.length * 10;
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
