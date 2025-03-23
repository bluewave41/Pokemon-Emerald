/*
  Warnings:

  - Added the required column `direction` to the `Warp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Warp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('UP', 'DOWN', 'LEFT', 'RIGHT');

-- CreateEnum
CREATE TYPE "WarpType" AS ENUM ('DOOR', 'CAVE');

-- AlterTable
ALTER TABLE "Warp" ADD COLUMN     "direction" "Direction" NOT NULL,
ADD COLUMN     "type" "WarpType" NOT NULL;
