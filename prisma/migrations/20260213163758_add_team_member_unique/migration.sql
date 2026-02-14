/*
  Warnings:

  - A unique constraint covering the columns `[teamId,userId]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TeamMember_teamId_idx";

-- DropIndex
DROP INDEX "TeamMember_userId_teamId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
