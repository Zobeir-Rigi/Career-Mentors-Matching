-- Remote willingness does not imply willingness to meet in person.
-- Rename the profile columns and require users to opt in to the new preference.
-- Historical match snapshots retain their original keys and meaning.
BEGIN;

ALTER TABLE "MenteeProfile" RENAME COLUMN "openToRemote" TO "openToInPerson";
ALTER TABLE "MentorProfile" RENAME COLUMN "openToRemote" TO "openToInPerson";

UPDATE "MenteeProfile" SET "openToInPerson" = false;
UPDATE "MentorProfile" SET "openToInPerson" = false;

COMMIT;
