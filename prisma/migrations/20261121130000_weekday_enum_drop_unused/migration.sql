-- Weekday enum for habit schedules (invalid legacy values are discarded).
CREATE TYPE "Weekday" AS ENUM ('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');

UPDATE "habits"
SET "days" = ARRAY(
  SELECT d
  FROM unnest("days") AS d
  WHERE d IN ('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT')
);

ALTER TABLE "habits"
  ALTER COLUMN "days" TYPE "Weekday"[] USING "days"::text[]::"Weekday"[];

-- "dateKey" already identifies the day; the extra timestamp was redundant.
ALTER TABLE "HabitCompletion" DROP COLUMN "date";

-- Sessions are JWT-based, so these tables are never used.
DROP TABLE "sessions";
DROP TABLE "verification_tokens";
