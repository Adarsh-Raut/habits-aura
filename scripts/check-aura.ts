/**
 * Verifies every user's stored aura equals what their completions say it
 * should be (100 + 10 per completion - 10 per skip). Aura is a cached total,
 * so this catches drift. Pass --fix to correct mismatches.
 *
 *   npm run aura:check
 *   npm run aura:check -- --fix
 */
import { PrismaClient } from "@prisma/client";
import { expectedAura } from "../lib/aura";

const prisma = new PrismaClient();
const fix = process.argv.includes("--fix");

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, auraPoints: true },
  });

  const counts = await prisma.$queryRaw<
    { userId: string; action: "COMPLETED" | "SKIPPED"; n: bigint }[]
  >`
    SELECT h."userId" AS "userId", c.action AS action, COUNT(*) AS n
    FROM "HabitCompletion" c
    JOIN habits h ON h.id = c."habitId"
    GROUP BY h."userId", c.action
  `;

  const byUser = new Map<string, { completed: number; skipped: number }>();
  for (const row of counts) {
    const entry = byUser.get(row.userId) ?? { completed: 0, skipped: 0 };
    if (row.action === "COMPLETED") entry.completed = Number(row.n);
    else entry.skipped = Number(row.n);
    byUser.set(row.userId, entry);
  }

  let drifted = 0;
  for (const user of users) {
    const { completed, skipped } = byUser.get(user.id) ?? {
      completed: 0,
      skipped: 0,
    };
    const expected = expectedAura(completed, skipped);

    if (expected !== user.auraPoints) {
      drifted++;
      console.log(
        `${user.email ?? user.id}: stored ${user.auraPoints}, expected ${expected}`,
      );
      if (fix) {
        await prisma.user.update({
          where: { id: user.id },
          data: { auraPoints: expected },
        });
      }
    }
  }

  console.log(
    drifted === 0
      ? `✅ All ${users.length} users are consistent`
      : `${fix ? "🔧 Fixed" : "⚠️  Found"} ${drifted} of ${users.length} users`,
  );
  process.exitCode = drifted > 0 && !fix ? 1 : 0;
}

main().finally(() => prisma.$disconnect());
