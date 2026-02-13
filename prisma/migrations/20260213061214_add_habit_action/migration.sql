/*
  Warnings:

  - Added the required column `action` to the `habit_completions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HabitAction" AS ENUM ('COMPLETED', 'SKIPPED');

-- AlterTable
ALTER TABLE "habit_completions" ADD COLUMN     "action" "HabitAction" NOT NULL;
