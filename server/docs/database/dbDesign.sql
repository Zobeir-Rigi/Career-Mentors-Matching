CREATE TYPE "Region" AS ENUM (
  'LONDON',
  'WEST_MIDLANDS',
  'SCOTLAND',
  'NORTH_WEST',
  'CAPE_TOWN',
  'SHEFFIELD',
  'OTHER'
);

CREATE TYPE "AvailabilityOptions" AS ENUM (
  'WEEKDAY_MORNING',
  'WEEKDAY_AFTERNOON',
  'WEEKDAY_EVENING',
  'WEEKEND_MORNING',
  'WEEKEND_AFTERNOON',
  'WEEKEND_EVENING'
);

CREATE TYPE "MeetingCadence" AS ENUM (
  'WEEKLY',
  'FORTNIGHTLY',
  'MONTHLY'
);

CREATE TYPE "MeetingStructure" AS ENUM (
  'OPEN',
  'STRUCTURED',
  'MIX'
);

CREATE TYPE "MatchStatus" AS ENUM (
  'CHEMISTRY_PENDING',
  'CHEMISTRY_CONFIRMED',
  'MATCH_PENDING',
  'ACTIVE',
  'COMPLETED',
  'DECLINED'
);

CREATE TYPE "WaitingStatus" AS ENUM (
  'WAITING',
  'NOTIFIED',
  'MATCHED'
);

CREATE TYPE "ApprovalStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'DECLINED'
);

CREATE TYPE "Roles" AS ENUM (
  'MENTEE',
  'MENTOR',
  'ADMIN'
);

CREATE TABLE "Users" (
  "id" uuid PRIMARY KEY,
  "fullName" varchar,
  "role" "Roles",
  "email" varchar UNIQUE NOT NULL,
  "passwordHashed" varchar NOT NULL,
  "linkedinURL" varchar,
  "scheduleURL" varchar,
  "createdAt" timestamp NOT NULL,
  "updatedAt" timestamp NOT NULL,
  "isActive" bool,
  "deactivatedAt" timestamp,
  "isEmailVerified" bool NOT NULL DEFAULT false
);

CREATE TABLE "MenteeProfile" (
  "id" uuid PRIMARY KEY,
  "userId" uuid UNIQUE NOT NULL,
  "currentJobTitle" varchar,
  "reasonsNote" varchar,
  "region" "Region",
  "openToRemote" bool NOT NULL,
  "Availability" "AvailabilityOptions"[],
  "meetingCadence" "MeetingCadence",
  "meetingStructure" "MeetingStructure",
  "bio" varchar
);

CREATE TABLE "MentorProfile" (
  "id" uuid PRIMARY KEY,
  "userId" uuid UNIQUE NOT NULL,
  "currentJobTitle" varchar,
  "capacity" int NOT NULL,
  "region" "Region",
  "openToRemote" bool NOT NULL,
  "Availability" "AvailabilityOptions"[],
  "meetingCadence" "MeetingCadence",
  "meetingStructure" "MeetingStructure",
  "bio" varchar,
  "isAcceptingMentees" bool NOT NULL DEFAULT false,
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "notifiedAdminAt" timestamp
);

CREATE TABLE "Disciplines" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL
);

CREATE TABLE "MenteeGoalDisciplines" (
  "menteeId" uuid,
  "disciplineId" uuid,
  PRIMARY KEY ("menteeId", "disciplineId")
);

CREATE TABLE "MentorDisciplines" (
  "mentorId" uuid,
  "disciplineId" uuid,
  PRIMARY KEY ("mentorId", "disciplineId")
);

CREATE TABLE "Skills" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL
);

CREATE TABLE "MenteeWantedSkills" (
  "menteeId" uuid,
  "skillId" uuid,
  PRIMARY KEY ("menteeId", "skillId")
);

CREATE TABLE "MentorSkills" (
  "mentorId" uuid,
  "skillId" uuid,
  PRIMARY KEY ("mentorId", "skillId")
);

CREATE TABLE "Industries" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL
);

CREATE TABLE "MenteeTargetedIndustries" (
  "menteeId" uuid,
  "industryId" uuid,
  PRIMARY KEY ("menteeId", "industryId")
);

CREATE TABLE "MentorDomainIndustries" (
  "mentorId" uuid,
  "industryId" uuid,
  PRIMARY KEY ("mentorId", "industryId")
);

CREATE TABLE "Matches" (
  "id" uuid PRIMARY KEY,
  "mentorId" uuid NOT NULL,
  "menteeId" uuid NOT NULL,
  "menteeSnapshot" json NOT NULL,
  "mentorSnapshot" json NOT NULL,
  "scores" float NOT NULL,
  "chemistryMenteeConfirmed" bool,
  "chemistryMentorConfirmed" bool,
  "scheduledCheckIn" timestamp,
  "checkInMenteeAgreed" bool,
  "checkInMentorAgreed" bool,
  "status" "MatchStatus" NOT NULL DEFAULT 'CHEMISTRY_PENDING',
  "createdAt" timestamp NOT NULL,
  "completedAt" timestamp,
  "declinedAt" timestamp
);

CREATE TABLE "MenteeWaitingList" (
  "id" uuid PRIMARY KEY,
  "menteeId" uuid UNIQUE,
  "createdAt" timestamp NOT NULL,
  "notifiedAdminAt" timestamp,
  "status" "WaitingStatus" NOT NULL DEFAULT 'WAITING'
);

CREATE TABLE "MatchingConfig" (
  "id" uuid PRIMARY KEY,
  "disciplineWeight" float NOT NULL,
  "skillWeight" float NOT NULL,
  "availabilityWeight" float NOT NULL,
  "locationWeight" float NOT NULL,
  "industryWeight" float NOT NULL,
  "meetingStyleWeight" float NOT NULL,
  "minScoreThreshold" float NOT NULL,
  "isActive" bool NOT NULL,
  "createdAt" timestamp NOT NULL,
  "updatedBy" uuid NOT NULL
);

ALTER TABLE "MenteeProfile" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MentorProfile" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MenteeGoalDisciplines" ADD FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MenteeGoalDisciplines" ADD FOREIGN KEY ("disciplineId") REFERENCES "Disciplines" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MentorDisciplines" ADD FOREIGN KEY ("mentorId") REFERENCES "MentorProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MentorDisciplines" ADD FOREIGN KEY ("disciplineId") REFERENCES "Disciplines" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MenteeWantedSkills" ADD FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MenteeWantedSkills" ADD FOREIGN KEY ("skillId") REFERENCES "Skills" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MentorSkills" ADD FOREIGN KEY ("mentorId") REFERENCES "MentorProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MentorSkills" ADD FOREIGN KEY ("skillId") REFERENCES "Skills" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MenteeTargetedIndustries" ADD FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MenteeTargetedIndustries" ADD FOREIGN KEY ("industryId") REFERENCES "Industries" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MentorDomainIndustries" ADD FOREIGN KEY ("mentorId") REFERENCES "MentorProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MentorDomainIndustries" ADD FOREIGN KEY ("industryId") REFERENCES "Industries" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Matches" ADD FOREIGN KEY ("mentorId") REFERENCES "MentorProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Matches" ADD FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MenteeWaitingList" ADD FOREIGN KEY ("menteeId") REFERENCES "MenteeProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "MatchingConfig" ADD FOREIGN KEY ("updatedBy") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
