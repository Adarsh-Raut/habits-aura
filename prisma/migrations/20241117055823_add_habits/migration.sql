-- CreateTable
CREATE TABLE "habits" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "days" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
