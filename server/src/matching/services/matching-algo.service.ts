import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MatchStatus, Region } from '../../generated/prisma/enums';
import {
  calculateDynamicScore,
  computeAllCategoryScores,
  isScoringCategoryKey,
  type ActiveRule,
  type CategoryScores,
} from '../engine/scoring.engine';
import { MatchingDataService } from './matching-data.service';

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

export const DEFAULT_THRESHOLD = 60;

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
      const mentee = await this.dataService.fetchMenteeContextByUserId(userId);
      if (!mentee) {
        throw new NotFoundException(`Mentee with user ID ${userId} not found`);
      }

      const config = await this.dataService.fetchActiveConfig();
      const threshold = normalizeThreshold(config?.minScoreThreshold);
      const activeRules = normalizeActiveRules(config?.weights);

      // Once a mentor has already appeared in this mentee's match history, do
      // not surface that mentor again. This avoids duplicate/repeated matches.
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

      const candidateMentors =
        await this.dataService.fetchEligibleCandidates(excludedMentorIds);

      if (!candidateMentors?.length) return [];

      const scoredMatches: ScoredMatch[] = [];

      for (const mentor of candidateMentors) {
        const capacityRelevantMatchCount = mentor.matches?.length ?? 0;
        if (
          mentor.capacity <= 0 ||
          capacityRelevantMatchCount >= mentor.capacity
        ) {
          continue;
        }

        const categoryScores = computeAllCategoryScores(mentee, mentor);
        const finalScore = calculateDynamicScore(categoryScores, activeRules);

        if (finalScore < threshold) continue;

        scoredMatches.push({
          mentorId: mentor.id,
          userId: mentor.userId,
          score: finalScore,
          categoryScores,
          profile: {
            fullName: mentor.user.fullName,
            currentJobTitle: mentor.currentJobTitle,
            region: mentor.region,
            openToRemote: mentor.openToRemote,
            bio: mentor.bio,
            linkedinURL: mentor.user.linkedinURL,
          },
        });
      }

      // Stable deterministic ranking for equal scores makes API responses and
      // tests reproducible.
      return scoredMatches.sort(
        (a, b) => b.score - a.score || a.mentorId.localeCompare(b.mentorId),
      );
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
