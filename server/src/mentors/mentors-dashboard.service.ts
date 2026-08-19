import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';
import { CAPACITY_RELEVANT_STATUSES } from '../common/constants/capacity-relevant-statuses';

import type { MentorEngagementSubStatus } from './dto/mentor-dashboard-response.dto';

@Injectable()
export class MentorDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  //   get the sub-status to match FE
  private deriveSubStatus(match: {
    status: MatchStatus;
    menteeAcceptedAt: Date | null;
    chemistryBookedAt: Date | null;
    chemistryMentorConfirmedAt: Date | null;
    chemistryMenteeConfirmedAt: Date | null;
  }): MentorEngagementSubStatus {
    if (match.status === MatchStatus.ACTIVE) return 'active';

    if (!match.menteeAcceptedAt) return 'proposed-awaiting-acceptance';

    if (!match.chemistryBookedAt) return 'awaiting-booking';

    if (!match.chemistryMentorConfirmedAt) return 'booked';

    if (match.chemistryMentorConfirmedAt && !match.chemistryMenteeConfirmedAt)
      return 'confirmed-waiting';

    return 'active';
  }

  private getEngagementDeadline(
    subStatus: MentorEngagementSubStatus,
    match: { proposalExpiresAt: Date | null; confirmationDueAt: Date | null },
  ): Date | null {
    switch (subStatus) {
      case 'confirmed-waiting':
      case 'booked':
        return match.confirmationDueAt;

      case 'proposed-awaiting-acceptance':
      case 'awaiting-booking':
      case 'active':
        return null;
    }
  }

  //   helper for countdown
  private getDaysLeft(expiresAt: Date | null): number | null {
    if (!expiresAt) return null;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diff = expiresAt.getTime() - Date.now();

    if (diff <= 0) return 0;

    return Math.ceil(diff / millisecondsPerDay);
  }

  //   dashboard query
  async getDashboard(userId: string) {
    const mentor = await this.prisma.mentorProfile.findUnique({
      where: { userId },

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

      const expiresAt = this.getEngagementDeadline(subStatus, match);

      const canRevealEmail = subStatus !== 'proposed-awaiting-acceptance';

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

        subStatus,

        mentee: {
          id: match.menteeProfile.id,
          fullName: match.menteeProfile.user.fullName,
          currentJobTitle: match.menteeProfile.currentJobTitle,
          bio: match.menteeProfile.bio,
          linkedinURL: match.menteeProfile.user.linkedinURL,
          focus,
          email: canRevealEmail ? match.menteeProfile.user.email : null,
        },

        countdown: {
          daysLeft: this.getDaysLeft(expiresAt),
          expiresAt,
        },
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
