/*
  Warnings:

  - A unique constraint covering the columns `[sourceUrl]` on the table `Navigation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceUrl` to the `Navigation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Navigation` table without a default value. This is not possible if the table is not empty.
  - Made the column `lastScrapedAt` on table `Navigation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Navigation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sourceUrl" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "lastScrapedAt" SET NOT NULL,
ALTER COLUMN "lastScrapedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_sourceUrl_key" ON "Navigation"("sourceUrl");
