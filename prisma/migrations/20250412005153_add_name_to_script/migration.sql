/*
  Warnings:

  - Added the required column `name` to the `Script` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Script" ADD COLUMN     "name" TEXT NOT NULL;
