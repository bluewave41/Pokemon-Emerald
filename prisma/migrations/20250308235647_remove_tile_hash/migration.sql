/*
  Warnings:

  - You are about to drop the column `hash` on the `Tiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[data]` on the table `Tiles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Tiles_hash_key";

-- AlterTable
ALTER TABLE "Tiles" DROP COLUMN "hash";

-- CreateIndex
CREATE UNIQUE INDEX "Tiles_data_key" ON "Tiles"("data");
