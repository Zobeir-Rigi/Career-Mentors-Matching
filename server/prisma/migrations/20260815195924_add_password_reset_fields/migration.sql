/*
  Warnings:

  - A unique constraint covering the columns `[passwordResetTokenHash]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "passwordResetExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Users_passwordResetTokenHash_key" ON "Users"("passwordResetTokenHash");
