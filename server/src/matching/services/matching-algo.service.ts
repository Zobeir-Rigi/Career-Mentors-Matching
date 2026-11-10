import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalStatus,
  MatchStatus,
  Region,
} from '../../generated/prisma/enums';
import {
  isScoringCategoryKey,
  type ActiveRule,
  type CategoryScores,
} from '../engine/scoring.engine';
import { MatchingDataService } from './matching-data.service';
import {
  toMenteeScoringInput,
  toMentorScoringInput,
} from '../engine/scoring.adapter';
import {
  selectMentorMatches,
  type MentorCandidate,
} from '../engine/candidate-selection';

export interface ScoredMatch {
  mentorId: string;
  userId: string;
  score: number;
  categoryScores: CategoryScores;
  profile: {
    fullName: string;
    currentJobTitle: string | null;
    region: Region | null;
    openToRemote: boolean;
    bio: string | null;
    linkedinURL: string | null;
  };
}

export const DEFAULT_WEIGHTS: readonly ActiveRule[] = [
  { categoryKey: 'disciplines', weight: 25 },
  { categoryKey: 'skills', weight: 25 },
  { categoryKey: 'availability', weight: 20 },
  { categoryKey: 'location', weight: 10 },
  { categoryKey: 'industries', weight: 10 },
  { categoryKey: 'meetingStructure', weight: 5 },
  { categoryKey: 'meetingCadence', weight: 5 },
];

export const DEFAULT_THRESHOLD = 70;

type MenteeMatchRecord = { mentorId: string; status: MatchStatus };

function normalizeThreshold(value: unknown): number {
  const threshold = Number(value);
  return Number.isFinite(threshold) && threshold >= 0 && threshold <= 100
    ? threshold
    : DEFAULT_THRESHOLD;
}

/**
 * Prisma Json fields can arrive either as the preferred ActiveRule[] shape or
 * as a legacy object map. Both are accepted at this boundary. Unknown keys and
 * invalid weights are discarded. If no usable rules remain, defaults are used.
 */
export function normalizeActiveRules(value: unknown): ActiveRule[] {
  const parsedRules: ActiveRule[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== 'object') continue;

      const categoryKey = (item as { categoryKey?: unknown }).categoryKey;
      const weight = Number((item as { weight?: unknown }).weight);

      if (
        typeof categoryKey === 'string' &&
        isScoringCategoryKey(categoryKey) &&
        Number.isFinite(weight) &&
        weight > 0
      ) {
        parsedRules.push({ categoryKey, weight });
      }
    }
  } else if (value && typeof value === 'object') {
    for (const [categoryKey, rawWeight] of Object.entries(value)) {
      const weight = Number(rawWeight);
      if (
        isScoringCategoryKey(categoryKey) &&
        Number.isFinite(weight) &&
        weight > 0
      ) {
        parsedRules.push({ categoryKey, weight });
      }
    }
  }

  if (parsedRules.length === 0) {
    return DEFAULT_WEIGHTS.map((rule) => ({ ...rule }));
  }

  // Last definition wins if malformed configuration duplicates a category.
  const byCategory = new Map(
    parsedRules.map((rule) => [rule.categoryKey, rule]),
  );
  return [...byCategory.values()];
}

@Injectable()
export class MatchingAlgoService {
  private readonly logger = new Logger(MatchingAlgoService.name);

  constructor(private readonly dataService: MatchingDataService) {}

  async findBestMatches(userId: string): Promise<ScoredMatch[]> {
    try {
      // 1. Load the mentee and their match history.
      const mentee = await this.dataService.fetchMenteeContextByUserId(userId);
      if (!mentee) {
        throw new NotFoundException(`Mentee with user ID ${userId} not found`);
      }

      // 2. Prepare the score threshold and weights.
      const config = await this.dataService.fetchActiveConfig();
      const threshold = normalizeThreshold(config?.minScoreThreshold);
      const activeRules = normalizeActiveRules(config?.weights);

      // 3. List previous mentors so they won't be suggested again.
      const menteeMatches = (mentee as { matches?: MenteeMatchRecord[] })
        .matches;
      const excludedMentorIds = [
        ...new Set(
          (menteeMatches ?? [])
            .filter(
              (match): match is MenteeMatchRecord =>
                Boolean(match) && typeof match.mentorId === 'string',
            )
            .map(({ mentorId }) => mentorId),
        ),
      ];

      // 4. Load approved, accepting mentors who aren't on that list.
      // Only matches that occupy a place are included in their match counts.
      const candidateMentors =
        await this.dataService.fetchEligibleCandidates(excludedMentorIds);

      if (!candidateMentors?.length) return [];

      // 5. Convert mentor records into matching inputs.
      const mentorMatchingInputs: MentorCandidate[] = candidateMentors.map(
        (mentor) => ({
          mentorId: mentor.id,
          isApproved: mentor.approvalStatus === ApprovalStatus.ACCEPTED,
          isAcceptingMentees: mentor.isAcceptingMentees,
          scoringInput: toMentorScoringInput(mentor),
          capacity: mentor.capacity,
          occupiedCapacity: mentor.matches?.length ?? 0,
        }),
      );

      // 6. Filter mentors, calculate scores and rank the results.
      const rankedMentorMatches = selectMentorMatches(
        toMenteeScoringInput(mentee),
        mentorMatchingInputs,
        excludedMentorIds,
        threshold,
        activeRules,
      );

      // 7. Store each loaded mentor under their ID for easy lookup.
      const mentorsById = new Map(
        candidateMentors.map((mentor) => [mentor.id, mentor]),
      );

      // 8. Add profile details without changing the ranked order.
      return rankedMentorMatches.map((match) => {
        const mentor = mentorsById.get(match.mentorId);

        // A selected mentor must exist in the records we loaded.
        if (!mentor) {
          throw new Error(
            `Selected mentor ${match.mentorId} was not in the candidate list`,
          );
        }

        return {
          mentorId: match.mentorId,
          userId: mentor.userId,
          score: match.score,
          categoryScores: match.categoryScores,
          profile: {
            fullName: mentor.user.fullName,
            currentJobTitle: mentor.currentJobTitle,
            region: mentor.region,
            openToRemote: mentor.openToRemote,
            bio: mentor.bio,
            linkedinURL: mentor.user.linkedinURL,
          },
        };
      });
    } catch (error) {
      // Keep "mentee not found" errors; log other failures below.
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Failed to calculate mentor matches for mentee ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to calculate mentor matches',
      );
    }
  }
}
