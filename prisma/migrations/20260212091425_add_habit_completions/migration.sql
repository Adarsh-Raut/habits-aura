/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `habits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "habits" DROP COLUMN "isCompleted";

-- CreateTable
CREATE TABLE "habit_completions" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "habit_completions_habitId_date_key" ON "habit_completions"("habitId", "date");

-- AddForeignKey
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
