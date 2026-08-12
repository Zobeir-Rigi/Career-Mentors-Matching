-- AlterTable
ALTER TABLE "Matches" ADD COLUMN     "chemistryBookedAt" TIMESTAMP(3),
ADD COLUMN     "chemistryMenteeConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "chemistryMentorConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmationDueAt" TIMESTAMP(3),
ADD COLUMN     "menteeAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "proposalExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Matches_mentorId_status_idx" ON "Matches"("mentorId", "status");
