ALTER TABLE "User"
ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "guestExpiresAt" TIMESTAMP(3);

CREATE INDEX "User_isGuest_guestExpiresAt_idx"
ON "User" ("isGuest", "guestExpiresAt");
