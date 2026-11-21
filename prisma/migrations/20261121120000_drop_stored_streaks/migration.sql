-- Streaks are now always computed from habit completions.
ALTER TABLE "habits" DROP COLUMN "currentStreak",
DROP COLUMN "longestStreak";
