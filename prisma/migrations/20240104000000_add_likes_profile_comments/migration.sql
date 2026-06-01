-- CreateTable JournalLike
CREATE TABLE "JournalLike" (
    "id" SERIAL NOT NULL,
    "journalId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JournalLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProfileComment
CREATE TABLE "ProfileComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "profileUserId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex unique like per user per journal
CREATE UNIQUE INDEX "JournalLike_journalId_userId_key" ON "JournalLike"("journalId", "userId");

-- AddForeignKey
ALTER TABLE "JournalLike" ADD CONSTRAINT "JournalLike_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalLike" ADD CONSTRAINT "JournalLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfileComment" ADD CONSTRAINT "ProfileComment_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfileComment" ADD CONSTRAINT "ProfileComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
