-- DropIndex
DROP INDEX "Team_organizationId_idx";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "isGeneral" BOOLEAN NOT NULL DEFAULT false;
