import {
  type ActiveRule,
  type CategoryScores,
  type MenteeScoringInput,
  type MentorScoringInput,
  calculateDynamicScore,
  computeAllCategoryScores,
} from './scoring.engine';

export interface MentorCandidate {
  mentorId: string;
  /** Has completed the required mentor approval process. */
  isApproved: boolean;
  /** Is currently willing to take new mentees; separate from capacity. */
  isAcceptingMentees: boolean;
  scoringInput: MentorScoringInput;
  capacity: number;
  occupiedCapacity: number;
}

export interface RankedCandidate {
  mentorId: string;
  score: number;
  categoryScores: CategoryScores;
}

/**
 * Filters and scores mentor candidates.
 *
 * Callers derive approval and acceptance flags from their own backend.
 * These inputs do not require particular database fields.
 *
 * occupiedCapacity counts only matches that currently occupy a place.
 * previousMentorIds contains this mentee's previously matched mentors.
 *
 * This function trusts the supplied facts; it does not query a database.
 */

export function selectMentorMatches(
  mentee: MenteeScoringInput,
  mentors: readonly MentorCandidate[],
  previousMentorIds: readonly string[],
  threshold: number,
  activeRules: readonly ActiveRule[],
): RankedCandidate[] {
  const excludedMentorIds = new Set(previousMentorIds);
  const rankedMentorMatches: RankedCandidate[] = [];

  for (const mentor of mentors) {
    // Mentor readiness
    if (!mentor.isApproved || !mentor.isAcceptingMentees) continue;

    // Previous matches
    if (excludedMentorIds.has(mentor.mentorId)) continue;

    // Capacity
    if (mentor.capacity <= 0 || mentor.occupiedCapacity >= mentor.capacity) {
      continue;
    }

    // scoring
    const categoryScores = computeAllCategoryScores(
      mentee,
      mentor.scoringInput,
    );

    const score = calculateDynamicScore(categoryScores, activeRules);

    if (score < threshold) continue;

    rankedMentorMatches.push({
      mentorId: mentor.mentorId,
      score,
      categoryScores,
    });
  }

  return rankedMentorMatches.sort(
    (a, b) => b.score - a.score || a.mentorId.localeCompare(b.mentorId),
  );
}
