import {
  MeetingCadence,
  MeetingStructure,
  Region,
} from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';

export type MenteeWithRelations = Prisma.MenteeProfileGetPayload<{
  include: {
    goalDisciplines: { include: { discipline: true } };
    wantedSkills: { include: { skill: true } };
    targetedIndustries: { include: { industry: true } };
  };
}>;

export type MentorWithRelations = Prisma.MentorProfileGetPayload<{
  include: {
    mentorDisciplines: { include: { discipline: true } };
    mentorSkills: { include: { skill: true } };
    mentorDomainIndustries: { include: { industry: true } };
  };
}>;

export const SCORING_CATEGORY_KEYS = [
  'disciplines',
  'skills',
  'industries',
  'availability',
  'location',
  'meetingStructure',
  'meetingCadence',
] as const;

export type ScoringCategoryKey = (typeof SCORING_CATEGORY_KEYS)[number];
export type CategoryScores = Record<ScoringCategoryKey, number>;

export interface ActiveRule {
  categoryKey: ScoringCategoryKey;
  weight: number;
}

export function isScoringCategoryKey(
  value: string,
): value is ScoringCategoryKey {
  return (SCORING_CATEGORY_KEYS as readonly string[]).includes(value);
}

/**
 * Scores multi-select preferences by the number of actual overlaps.
 *
 * An empty mentee set means "no restriction", so it scores 1.
 *
 * Additional unmatched mentee preferences do not reduce the score.
 * Each additional actual overlap improves the score with diminishing returns:
 *
 * 0 overlaps = 0
 * 1 overlap  = 0.5
 * 2 overlaps = 0.75
 * 3 overlaps = 0.875
 * 4 overlaps = 0.9375
 */
export function calculateArrayOverlapScore(
  menteeItems: readonly string[] | undefined | null,
  mentorItems: readonly string[] | undefined | null,
): number {
  const menteeSet = new Set(menteeItems ?? []);

  if (menteeSet.size === 0) return 1;

  const mentorSet = new Set(mentorItems ?? []);

  if (mentorSet.size === 0) return 0;

  let matchCount = 0;

  for (const item of menteeSet) {
    if (mentorSet.has(item)) {
      matchCount += 1;
    }
  }

  if (matchCount === 0) return 0;

  return 1 - Math.pow(0.25, matchCount);
}

/**
 * A location is compatible when the regions match, or when both people are
 * open to a remote mentoring relationship.
 */
export function calculateLocationScore(
  menteeRegion: Region | null | undefined,
  mentorRegion: Region | null | undefined,
  menteeOpenToRemote: boolean,
  mentorOpenToRemote: boolean,
): number {
  if (menteeRegion && mentorRegion && menteeRegion === mentorRegion) return 1;
  if (menteeOpenToRemote && mentorOpenToRemote) return 1;
  return 0;
}

export function calculateMeetingStructureScore(
  menteeStructure: MeetingStructure | null | undefined,
  mentorStructure: MeetingStructure | null | undefined,
): number {
  if (!menteeStructure || !mentorStructure) return 0;
  return menteeStructure === mentorStructure ? 1 : 0;
}

export function calculateMeetingCadenceScore(
  menteeCadence: MeetingCadence | null | undefined,
  mentorCadence: MeetingCadence | null | undefined,
): number {
  if (!menteeCadence || !mentorCadence) return 0;
  return menteeCadence === mentorCadence ? 1 : 0;
}

/**
 * Computes every category using canonical relation IDs for database-backed
 * disciplines, skills and industries. Display-name changes therefore cannot
 * alter matching behaviour.
 */
export function computeAllCategoryScores(
  menteeProfile: MenteeWithRelations,
  mentorProfile: MentorWithRelations,
): CategoryScores {
  return {
    disciplines: calculateArrayOverlapScore(
      menteeProfile.goalDisciplines?.map(({ disciplineId }) => disciplineId),
      mentorProfile.mentorDisciplines?.map(({ disciplineId }) => disciplineId),
    ),
    skills: calculateArrayOverlapScore(
      menteeProfile.wantedSkills?.map(({ skillId }) => skillId),
      mentorProfile.mentorSkills?.map(({ skillId }) => skillId),
    ),
    industries: calculateArrayOverlapScore(
      menteeProfile.targetedIndustries?.map(({ industryId }) => industryId),
      mentorProfile.mentorDomainIndustries?.map(({ industryId }) => industryId),
    ),
    availability: calculateArrayOverlapScore(
      menteeProfile.availability,
      mentorProfile.availability,
    ),
    location: calculateLocationScore(
      menteeProfile.region,
      mentorProfile.region,
      menteeProfile.openToRemote,
      mentorProfile.openToRemote,
    ),
    meetingStructure: calculateMeetingStructureScore(
      menteeProfile.meetingStructure,
      mentorProfile.meetingStructure,
    ),
    meetingCadence: calculateMeetingCadenceScore(
      menteeProfile.meetingCadence,
      mentorProfile.meetingCadence,
    ),
  };
}

/**
 * Produces a 0..100 weighted score. Invalid/non-positive weights are ignored.
 * Category values are clamped to 0..1 as a final defensive boundary.
 */
export function calculateDynamicScore(
  categoryScores: CategoryScores,
  rules: readonly ActiveRule[],
): number {
  const validRules = rules.filter(
    ({ weight }) => Number.isFinite(weight) && weight > 0,
  );

  const totalWeight = validRules.reduce((sum, { weight }) => sum + weight, 0);
  if (totalWeight <= 0) return 0;

  const weightedTotal = validRules.reduce((sum, { categoryKey, weight }) => {
    const rawCategoryScore = categoryScores[categoryKey];
    const safeCategoryScore = Number.isFinite(rawCategoryScore)
      ? Math.min(1, Math.max(0, rawCategoryScore))
      : 0;

    return sum + safeCategoryScore * weight;
  }, 0);

  return Math.round((weightedTotal / totalWeight) * 100);
}
