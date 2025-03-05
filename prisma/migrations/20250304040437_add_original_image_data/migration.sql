/*
  Warnings:

  - Added the required column `original` to the `Tiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tiles" ADD COLUMN     "original" TEXT NOT NULL;
