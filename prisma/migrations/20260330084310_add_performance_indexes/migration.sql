-- CreateIndex
CREATE INDEX "HabitCompletion_habitId_action_dateKey_idx" ON "HabitCompletion"("habitId", "action", "dateKey");

-- CreateIndex
CREATE INDEX "User_auraPoints_idx" ON "User"("auraPoints");

-- CreateIndex
CREATE INDEX "habits_userId_idx" ON "habits"("userId");
