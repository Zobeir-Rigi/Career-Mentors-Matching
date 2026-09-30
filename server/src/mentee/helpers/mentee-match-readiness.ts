import { hasCompleteBio } from '@/common/utils/bio-validation';

interface MenteeProfileWithRelations {
  reasonsNote: string | null;
  bio: string | null;

  user: {
    linkedinURL: string | null;
  };
  region: unknown;
  availability: readonly unknown[];
  meetingCadence: unknown;
  meetingStructure: unknown;
  goalDisciplines: readonly unknown[];
  wantedSkills: readonly unknown[];
  targetedIndustries: readonly unknown[];
}

export function isMenteeMatchReady(
  profile: MenteeProfileWithRelations,
): boolean {
  return Boolean(
    profile.reasonsNote?.trim() &&
    hasCompleteBio(profile.bio) &&
    profile.user.linkedinURL?.trim() &&
    profile.region &&
    profile.availability.length > 0 &&
    profile.goalDisciplines.length > 0 &&
    profile.wantedSkills.length > 0 &&
    profile.targetedIndustries.length > 0 &&
    profile.meetingCadence &&
    profile.meetingStructure,
  );
}
