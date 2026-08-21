import { Injectable, NotFoundException } from '@nestjs/common';

import { CAPACITY_RELEVANT_STATUSES } from '@/common/constants/capacity-relevant-statuses';

import { MatchStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

import type {
  MenteeDashboardCurrentMatchDto,
  MenteeDashboardResponseDto,
  MenteeJourneyStage,
  MenteeMatchSubStatus,
} from './dto/mentee-dashboard-response.dto';

import { isMenteeMatchReady } from './helpers/mentee-match-readiness';

interface DashboardMatchState {
  status: MatchStatus;
  chemistryBookedAt: Date | null;
}

@Injectable()
export class MenteeDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private deriveJourneyStage(
    matchReady: boolean,
    match: DashboardMatchState | null,
  ): MenteeJourneyStage {
    if (!match) {
      return matchReady ? 'ready' : 'incomplete';
    }

    switch (match.status) {
      case MatchStatus.CHEMISTRY_PENDING:
        return 'match-proposed';

      case MatchStatus.CHEMISTRY_CONFIRMED:
      case MatchStatus.MATCH_PENDING:
        return 'chemistry-confirm';

      case MatchStatus.ACTIVE:
        return 'mentorship-active';

      default:
        return matchReady ? 'ready' : 'incomplete';
    }
  }

  private deriveMatchSubStatus(
    match: DashboardMatchState,
  ): MenteeMatchSubStatus {
    switch (match.status) {
      case MatchStatus.CHEMISTRY_PENDING:
        return 'proposed';

      case MatchStatus.CHEMISTRY_CONFIRMED:
        return match.chemistryBookedAt ? 'booked' : 'awaiting-booking';

      case MatchStatus.MATCH_PENDING:
        return 'confirmed-waiting';

      case MatchStatus.ACTIVE:
        return 'active';

      default:
        throw new Error(
          `Unsupported current match status: ${String(match.status)}`,
        );
    }
  }

  private getEngagementDeadline(match: {
    status: MatchStatus;
    proposalExpiresAt: Date | null;
    checkInExpiresAt: Date | null;
  }): Date | null {
    switch (match.status) {
      case MatchStatus.CHEMISTRY_PENDING:
        return match.proposalExpiresAt;

      case MatchStatus.MATCH_PENDING:
        return match.checkInExpiresAt;

      case MatchStatus.CHEMISTRY_CONFIRMED:
      case MatchStatus.ACTIVE:
        return null;

      default:
        return null;
    }
  }

  private getDaysLeft(expiresAt: Date | null): number | null {
    if (!expiresAt) {
      return null;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const difference = expiresAt.getTime() - Date.now();

    if (difference <= 0) {
      return 0;
    }

    return Math.ceil(difference / millisecondsPerDay);
  }

  private mapCurrentMatch(match: {
    id: string;
    status: MatchStatus;
    chemistryBookedAt: Date | null;
    scheduledCheckIn: Date | null;
    proposalExpiresAt: Date | null;
    checkInExpiresAt: Date | null;
    checkInMenteeAgreed: boolean | null;
    checkInMentorAgreed: boolean | null;
    mentorProfile: {
      id: string;
      currentJobTitle: string | null;
      bio: string | null;
      user: {
        fullName: string;
        email: string;
        linkedinURL: string | null;
        scheduleURL: string | null;
      };
      mentorDisciplines: {
        discipline: {
          name: string;
        };
      }[];
    };
  }): MenteeDashboardCurrentMatchDto {
    const subStatus = this.deriveMatchSubStatus(match);

    const canRevealContactDetails =
      match.status !== MatchStatus.CHEMISTRY_PENDING;

    const expiresAt = this.getEngagementDeadline(match);

    return {
      id: match.id,

      status: match.status,

      subStatus,

      mentor: {
        id: match.mentorProfile.id,
        fullName: match.mentorProfile.user.fullName,
        currentJobTitle: match.mentorProfile.currentJobTitle,
        bio: match.mentorProfile.bio,
        linkedinURL: match.mentorProfile.user.linkedinURL,

        calendarLink: canRevealContactDetails
          ? match.mentorProfile.user.scheduleURL
          : null,

        focusAreas: match.mentorProfile.mentorDisciplines.map(
          (item) => item.discipline.name,
        ),

        email: canRevealContactDetails ? match.mentorProfile.user.email : null,
      },

      countdown: {
        daysLeft: this.getDaysLeft(expiresAt),
        expiresAt,
      },

      checkIn: {
        menteeAgreed: match.checkInMenteeAgreed,
        mentorAgreed: match.checkInMentorAgreed,
      },

      chemistryBookedAt: match.chemistryBookedAt,

      scheduledCheckIn: match.scheduledCheckIn,
    };
  }

  async getDashboard(userId: string): Promise<MenteeDashboardResponseDto> {
    const mentee = await this.prisma.menteeProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            linkedinURL: true,
          },
        },

        goalDisciplines: {
          include: {
            discipline: {
              select: {
                name: true,
              },
            },
          },
        },

        wantedSkills: {
          include: {
            skill: true,
          },
        },

        targetedIndustries: {
          include: {
            industry: true,
          },
        },

        matches: {
          include: {
            mentorProfile: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    linkedinURL: true,
                    scheduleURL: true,
                  },
                },

                mentorDisciplines: {
                  include: {
                    discipline: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!mentee) {
      throw new NotFoundException('Mentee profile not found');
    }

    const goals = mentee.goalDisciplines.map((goal) => goal.discipline.name);

    const matchReady = isMenteeMatchReady(mentee);

    const currentMatch =
      mentee.matches.find((match) =>
        CAPACITY_RELEVANT_STATUSES.includes(match.status),
      ) ?? null;

    const pastMatches = mentee.matches
      .filter(
        (match) =>
          match.status === MatchStatus.COMPLETED ||
          match.status === MatchStatus.DECLINED,
      )
      .map((match) => ({
        id: match.id,
        mentorName: match.mentorProfile.user.fullName,

        focusAreas: match.mentorProfile.mentorDisciplines.map(
          (item) => item.discipline.name,
        ),

        status: match.status,
        completedAt: match.completedAt,
        declinedAt: match.declinedAt,
      }));

    const journeyStage = this.deriveJourneyStage(matchReady, currentMatch);

    return {
      fullName: mentee.user.fullName,
      journeyStage,
      matchReady,
      goals,

      currentMatch: currentMatch ? this.mapCurrentMatch(currentMatch) : null,

      pastMatches,
    };
  }
}
