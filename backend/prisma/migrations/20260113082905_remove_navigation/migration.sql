/*
  Warnings:

  - You are about to drop the column `navigationId` on the `collection` table. All the data in the column will be lost.
  - You are about to drop the `Navigation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "collection" DROP CONSTRAINT "collection_navigationId_fkey";

-- DropIndex
DROP INDEX "collection_slug_navigationId_key";

-- AlterTable
ALTER TABLE "collection" DROP COLUMN "navigationId";

-- DropTable
DROP TABLE "Navigation";
