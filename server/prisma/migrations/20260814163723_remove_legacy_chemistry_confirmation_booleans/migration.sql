/*
  Warnings:

  - You are about to drop the column `chemistryMenteeConfirmed` on the `Matches` table. All the data in the column will be lost.
  - You are about to drop the column `chemistryMentorConfirmed` on the `Matches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Matches" DROP COLUMN "chemistryMenteeConfirmed",
DROP COLUMN "chemistryMentorConfirmed";
