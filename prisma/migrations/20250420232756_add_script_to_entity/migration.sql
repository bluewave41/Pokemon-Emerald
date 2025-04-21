/*
  Warnings:

  - You are about to drop the column `bank` on the `Entity` table. All the data in the column will be lost.
  - Added the required column `bankId` to the `Entity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scriptId` to the `Entity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_bank_fkey";

-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "bank",
ADD COLUMN     "bankId" INTEGER NOT NULL,
ADD COLUMN     "scriptId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "SpriteBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE CASCADE ON UPDATE CASCADE;
