import { Injectable, NotFoundException } from '@nestjs/common';

import { CAPACITY_RELEVANT_STATUSES } from '../common/constants/capacity-relevant-statuses';
import { MatchStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

import type { MentorEngagementSubStatus } from './dto/mentor-dashboard-response.dto';

interface DashboardMatchState {
  status: MatchStatus;
  chemistryBookedAt: Date | null;
}

@Injectable()
export class MentorDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private deriveSubStatus(
    match: DashboardMatchState,
  ): MentorEngagementSubStatus {
    switch (match.status) {
      case MatchStatus.CHEMISTRY_PENDING:
        return 'proposed-awaiting-acceptance';

      case MatchStatus.CHEMISTRY_CONFIRMED:
        return match.chemistryBookedAt ? 'booked' : 'awaiting-booking';

      case MatchStatus.MATCH_PENDING:
        return 'confirmed-waiting';

      case MatchStatus.ACTIVE:
        return 'active';

      default:
        throw new Error(
          `Unsupported mentor dashboard match status: ${String(match.status)}`,
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

  async getDashboard(userId: string) {
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: {
        userId,
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },

        mentorDisciplines: {
          include: {
            discipline: true,
          },
        },

        matches: {
          where: {
            status: {
              in: CAPACITY_RELEVANT_STATUSES,
            },
          },

          include: {
            menteeProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    linkedinURL: true,
                  },
                },

                goalDisciplines: {
                  include: {
                    discipline: true,
                  },
                },
              },
            },
          },

          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor profile not found');
    }

    const filled = mentor.matches.length;
    const total = mentor.capacity;

    const engagements = mentor.matches.map((match) => {
      const subStatus = this.deriveSubStatus(match);

      const expiresAt = this.getEngagementDeadline(match);

      const canRevealEmail = match.status !== MatchStatus.CHEMISTRY_PENDING;

      const disciplineGoals = match.menteeProfile.goalDisciplines.map(
        (item) => item.discipline.name,
      );

      const focus =
        disciplineGoals.length > 0
          ? disciplineGoals.join(', ')
          : (match.menteeProfile.currentJobTitle ??
            match.menteeProfile.reasonsNote ??
            null);

      return {
        id: match.id,

        status: match.status,

        subStatus,

        mentee: {
          id: match.menteeProfile.id,

          fullName: match.menteeProfile.user.fullName,

          currentJobTitle: match.menteeProfile.currentJobTitle,

          bio: match.menteeProfile.bio,

          reasonsNote: match.menteeProfile.reasonsNote,

          goals: disciplineGoals,

          /*
           * LinkedIn is profile context rather
           * than private chemistry contact data,
           * so the mentor can use it when deciding.
           */
          linkedinURL: match.menteeProfile.user.linkedinURL,

          focus,

          /*
           * Email remains private until
           * the mentor accepts chemistry.
           */
          email: canRevealEmail ? match.menteeProfile.user.email : null,
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
    });

    return {
      fullName: mentor.user.fullName,

      capacity: {
        filled,
        total,
        isAtCapacity: filled >= total,
      },

      isAcceptingMentees: mentor.isAcceptingMentees,

      engagements,

      profileSummary: {
        disciplines: mentor.mentorDisciplines.map(
          (item) => item.discipline.name,
        ),

        bio: mentor.bio ?? '',
      },
    };
  }
}
