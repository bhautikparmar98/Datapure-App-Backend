/*
  Warnings:

  - You are about to drop the column `numberOfProjects` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `numberOfProjects`,
    ADD COLUMN `numberOfActiveProjects` INTEGER NOT NULL DEFAULT 0;
