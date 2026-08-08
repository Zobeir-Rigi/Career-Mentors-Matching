-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('CHEMISTRY_PENDING', 'CHEMISTRY_CONFIRMED', 'MATCH_PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "WaitingStatus" AS ENUM ('WAITING', 'NOTIFIED', 'MATCHED');

-- CreateTable
CREATE TABLE "Skills" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disciplines" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorSkills" (
    "mentorId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "MentorSkills_pkey" PRIMARY KEY ("mentorId","skillId")
);

-- CreateTable
CREATE TABLE "MentorDisciplines" (
    "mentorId" UUID NOT NULL,
    "disciplineId" UUID NOT NULL,

    CONSTRAINT "MentorDisciplines_pkey" PRIMARY KEY ("mentorId","disciplineId")
);

-- CreateTable
CREATE TABLE "MentorDomainIndustries" (
    "mentorId" UUID NOT NULL,
    "industryId" UUID NOT NULL,

    CONSTRAINT "MentorDomainIndustries_pkey" PRIMARY KEY ("mentorId","industryId")
);

-- CreateTable
CREATE TABLE "MenteeWantedSkills" (
    "menteeId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "MenteeWantedSkills_pkey" PRIMARY KEY ("menteeId","skillId")
);

-- CreateTable
CREATE TABLE "MenteeGoalDisciplines" (
    "menteeId" UUID NOT NULL,
    "disciplineId" UUID NOT NULL,

    CONSTRAINT "MenteeGoalDisciplines_pkey" PRIMARY KEY ("menteeId","disciplineId")
);

-- CreateTable
CREATE TABLE "MenteeTargetIndustries" (
    "menteeId" UUID NOT NULL,
    "industryId" UUID NOT NULL,

    CONSTRAINT "MenteeTargetIndustries_pkey" PRIMARY KEY ("menteeId","industryId")
);

-- CreateTable
CREATE TABLE "Matches" (
    "id" UUID NOT NULL,
    "mentorId" UUID NOT NULL,
    "menteeId" UUID NOT NULL,
    "menteeSnapshot" JSON NOT NULL,
    "mentorSnapshot" JSON NOT NULL,
    "scores" DOUBLE PRECISION NOT NULL,
    "chemistryMenteeConfirmed" BOOLEAN,
    "chemistryMentorConfirmed" BOOLEAN,
    "scheduledCheckIn" TIMESTAMP(3),
    "checkInMenteeAgreed" BOOLEAN,
    "checkInMentorAgreed" BOOLEAN,
    "status" "MatchStatus" NOT NULL DEFAULT 'CHEMISTRY_PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingConfig" (
    "id" UUID NOT NULL,
    "disciplineWeight" DOUBLE PRECISION NOT NULL,
    "skillWeight" DOUBLE PRECISION NOT NULL,
    "availabilityWeight" DOUBLE PRECISION NOT NULL,
    "locationWeight" DOUBLE PRECISION NOT NULL,
    "industryWeight" DOUBLE PRECISION NOT NULL,
    "meetingStyleWeight" DOUBLE PRECISION NOT NULL,
    "minScoreThreshold" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID NOT NULL,

    CONSTRAINT "MatchingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenteeWaitingList" (
    "id" UUID NOT NULL,
    "menteeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAdminAt" TIMESTAMP(3),
    "status" "WaitingStatus" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "MenteeWaitingList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skills_name_key" ON "Skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Disciplines_name_key" ON "Disciplines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Industries_name_key" ON "Industries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MenteeWaitingList_menteeId_key" ON "MenteeWaitingList"("menteeId");

-- AddForeignKey
ALTER TABLE "MentorSkills" ADD CONSTRAINT "MentorSkills_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorSkills" ADD CONSTRAINT "MentorSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorDisciplines" ADD CONSTRAINT "MentorDisciplines_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorDisciplines" ADD CONSTRAINT "MentorDisciplines_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorDomainIndustries" ADD CONSTRAINT "MentorDomainIndustries_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorDomainIndustries" ADD CONSTRAINT "MentorDomainIndustries_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeWantedSkills" ADD CONSTRAINT "MenteeWantedSkills_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeWantedSkills" ADD CONSTRAINT "MenteeWantedSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeGoalDisciplines" ADD CONSTRAINT "MenteeGoalDisciplines_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeGoalDisciplines" ADD CONSTRAINT "MenteeGoalDisciplines_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeTargetIndustries" ADD CONSTRAINT "MenteeTargetIndustries_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeTargetIndustries" ADD CONSTRAINT "MenteeTargetIndustries_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MatchingConfig" ADD CONSTRAINT "MatchingConfig_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeWaitingList" ADD CONSTRAINT "MenteeWaitingList_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
