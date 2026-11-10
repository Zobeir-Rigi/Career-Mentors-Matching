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
    openToInPerson: boolean;
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
      // 1. Load the mentee's preferences and match history from the database.
      const mentee = await this.dataService.fetchMenteeContextByUserId(userId);
      if (!mentee) {
        throw new NotFoundException(`Mentee with user ID ${userId} not found`);
      }

      // 2. Load configuration and convert it into usable threshold and weight inputs.
      const config = await this.dataService.fetchActiveConfig();
      const threshold = normalizeThreshold(config?.minScoreThreshold);
      const activeRules = normalizeActiveRules(config?.weights);

      // 3. Collect unique previous mentor IDs, regardless of match status.
      // Both the database query and the pure selection function exclude these IDs.
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

      // 4. Fetch approved mentors accepting mentees, excluding previous mentors.
      // Their loaded matches include only statuses that occupy capacity.
      const candidateMentors =
        await this.dataService.fetchEligibleCandidates(excludedMentorIds);

      if (!candidateMentors?.length) return [];

      // 5. Convert database records into the plain inputs selection needs.
      // The scoring adapter extracts preference IDs; the match count supplies occupied capacity.
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

      // 6. Convert the mentee's preferences, then filter, score and rank mentors.
      // This pure function receives all its data and makes no database requests.
      const rankedMentorMatches = selectMentorMatches(
        toMenteeScoringInput(mentee),
        mentorMatchingInputs,
        excludedMentorIds,
        threshold,
        activeRules,
      );

      // 7. Build an in-memory lookup: each pair is [mentor ID, full mentor record].
      // This lets us attach profile details without fetching the mentors again.
      const mentorsById = new Map(
        candidateMentors.map((mentor) => [mentor.id, mentor]),
      );

      // 8. Attach display details to each selected result, preserving its ranked order.
      return rankedMentorMatches.map((match) => {
        const mentor = mentorsById.get(match.mentorId);

        // Every selected ID must come from the supplied candidate records.
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
            openToInPerson: mentor.openToInPerson,
            bio: mentor.bio,
            linkedinURL: mentor.user.linkedinURL,
          },
        };
      });
    } catch (error) {
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
