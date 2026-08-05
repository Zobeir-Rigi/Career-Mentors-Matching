-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('MENTEE', 'MENTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('LONDON', 'WEST_MIDLANDS', 'SCOTLAND', 'NORTH_WEST', 'CAPE_TOWN', 'SHEFFIELD', 'OTHER');

-- CreateEnum
CREATE TYPE "AvailabilityOptions" AS ENUM ('WEEKDAY_MORNING', 'WEEKDAY_AFTERNOON', 'WEEKDAY_EVENING', 'WEEKEND_MORNING', 'WEEKEND_AFTERNOON', 'WEEKEND_EVENING');

-- CreateEnum
CREATE TYPE "MeetingCadence" AS ENUM ('WEEKLY', 'FORTNIGHTLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "MeetingStructure" AS ENUM ('OPEN', 'STRUCTURED', 'MIX');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHashed" TEXT NOT NULL,
    "linkedinURL" TEXT,
    "scheduleURL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationTokenHash" TEXT,
    "emailVerificationExpiresAt" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenteeProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "currentJobTitle" TEXT,
    "reasonsNote" TEXT,
    "region" "Region",
    "openToRemote" BOOLEAN NOT NULL DEFAULT false,
    "Availability" "AvailabilityOptions"[],
    "meetingCadence" "MeetingCadence",
    "meetingStructure" "MeetingStructure",
    "bio" TEXT,

    CONSTRAINT "MenteeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "currentJobTitle" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "region" "Region",
    "openToRemote" BOOLEAN NOT NULL DEFAULT false,
    "Availability" "AvailabilityOptions"[],
    "meetingCadence" "MeetingCadence",
    "meetingStructure" "MeetingStructure",
    "bio" TEXT,
    "isAcceptingMentees" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notifiedAdminAt" TIMESTAMP(3),

    CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_emailVerificationTokenHash_key" ON "Users"("emailVerificationTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "MenteeProfile_userId_key" ON "MenteeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_userId_key" ON "MentorProfile"("userId");

-- AddForeignKey
ALTER TABLE "MenteeProfile" ADD CONSTRAINT "MenteeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
