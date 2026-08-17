/*
  Warnings:

  - You are about to drop the column `availabilityWeight` on the `MatchingConfig` table. All the data in the column will be lost.
  - You are about to drop the column `disciplineWeight` on the `MatchingConfig` table. All the data in the column will be lost.
  - You are about to drop the column `industryWeight` on the `MatchingConfig` table. All the data in the column will be lost.
  - You are about to drop the column `locationWeight` on the `MatchingConfig` table. All the data in the column will be lost.
  - You are about to drop the column `meetingStyleWeight` on the `MatchingConfig` table. All the data in the column will be lost.
  - You are about to drop the column `skillWeight` on the `MatchingConfig` table. All the data in the column will be lost.
  - Added the required column `weights` to the `MatchingConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchingConfig" DROP COLUMN "availabilityWeight",
DROP COLUMN "disciplineWeight",
DROP COLUMN "industryWeight",
DROP COLUMN "locationWeight",
DROP COLUMN "meetingStyleWeight",
DROP COLUMN "skillWeight",
ADD COLUMN     "weights" JSON NOT NULL;
