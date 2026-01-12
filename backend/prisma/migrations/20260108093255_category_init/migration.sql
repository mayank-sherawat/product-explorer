/*
  Warnings:

  - A unique constraint covering the columns `[slug,navigationId]` on the table `collection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceUrl` to the `collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `collection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "collection" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sourceUrl" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "collection_slug_navigationId_key" ON "collection"("slug", "navigationId");
