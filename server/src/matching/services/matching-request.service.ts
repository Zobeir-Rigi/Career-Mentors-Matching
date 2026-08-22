import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CAPACITY_RELEVANT_STATUSES } from '@/common/constants/capacity-relevant-statuses';
import type { Prisma } from '@/generated/prisma/client';
import { MatchStatus, Role, WaitingStatus } from '@/generated/prisma/enums';
import { MailService } from '@/mail/mail.service';
import { PrismaService } from '@/prisma/prisma.service';

import { MatchingAlgoService } from './matching-algo.service';

const PROPOSAL_EXPIRY_DAYS = 7;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

type MenteeWithRelations = Prisma.MenteeProfileGetPayload<{
  include: {
    goalDisciplines: {
      include: {
        discipline: true;
      };
    };
    wantedSkills: {
      include: {
        skill: true;
      };
    };
    targetedIndustries: {
      include: {
        industry: true;
      };
    };
  };
}>;

type MentorWithRelations = Prisma.MentorProfileGetPayload<{
  include: {
    user: {
      select: {
        fullName: true;
      };
    };
    mentorDisciplines: {
      include: {
        discipline: true;
      };
    };
    mentorSkills: {
      include: {
        skill: true;
      };
    };
    mentorDomainIndustries: {
      include: {
        industry: true;
      };
    };
  };
}>;

@Injectable()
export class MatchingRequestService {
  private readonly logger = new Logger(MatchingRequestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingAlgoService: MatchingAlgoService,
    private readonly mailService: MailService,
  ) {}

  private buildMenteeSnapshot(mentee: MenteeWithRelations) {
    return {
      region: mentee.region,
      openToRemote: mentee.openToRemote,
      availability: mentee.availability,
      meetingCadence: mentee.meetingCadence,
      meetingStructure: mentee.meetingStructure,

      disciplines: mentee.goalDisciplines.map((item) => item.discipline.name),

      skills: mentee.wantedSkills.map((item) => item.skill.name),

      industries: mentee.targetedIndustries.map((item) => item.industry.name),
    };
  }

  private buildMentorSnapshot(mentor: MentorWithRelations) {
    return {
      fullName: mentor.user.fullName,
      currentJobTitle: mentor.currentJobTitle,
      region: mentor.region,
      openToRemote: mentor.openToRemote,
      availability: mentor.availability,
      meetingCadence: mentor.meetingCadence,
      meetingStructure: mentor.meetingStructure,

      disciplines: mentor.mentorDisciplines.map((item) => item.discipline.name),

      skills: mentor.mentorSkills.map((item) => item.skill.name),

      industries: mentor.mentorDomainIndustries.map(
        (item) => item.industry.name,
      ),
    };
  }

  private getProposalExpiry(): Date {
    return new Date(Date.now() + PROPOSAL_EXPIRY_DAYS * MILLISECONDS_PER_DAY);
  }

  private async notifyAdminsAboutWaitingMentee({
    menteeFullName,
    menteeEmail,
    menteeId,
  }: {
    menteeFullName: string;
    menteeEmail: string;
    menteeId: string;
  }): Promise<boolean> {
    const admins = await this.prisma.user.findMany({
      where: {
        role: Role.ADMIN,
        isActive: true,
      },

      select: {
        email: true,
        fullName: true,
      },
    });

    if (admins.length === 0) {
      this.logger.warn(
        `No active admin account was available to notify for waiting mentee ${menteeId}`,
      );

      return false;
    }

    try {
      await Promise.all(
        admins.map((admin) =>
          this.mailService.sendMenteeWaitingListAdminEmail({
            email: admin.email,
            adminFullName: admin.fullName,
            menteeFullName,
            menteeEmail,
          }),
        ),
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Waiting-list admin email could not be sent for mentee ${menteeId}`,
        error instanceof Error ? error.stack : undefined,
      );

      return false;
    }
  }

  async requestMatch(userId: string) {
    const mentee = await this.prisma.menteeProfile.findUnique({
      where: {
        userId,
      },

      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },

        goalDisciplines: {
          include: {
            discipline: true,
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
      },
    });

    if (!mentee) {
      throw new NotFoundException('Mentee profile not found');
    }

    const existingMatch = await this.prisma.matches.findFirst({
      where: {
        menteeId: mentee.id,

        status: {
          in: CAPACITY_RELEVANT_STATUSES,
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingMatch) {
      return {
        status: 'MATCHED' as const,
        matchId: existingMatch.id,
      };
    }

    const recommendations =
      await this.matchingAlgoService.findBestMatches(userId);

    if (recommendations.length === 0) {
      const existingWaitingEntry =
        await this.prisma.menteeWaitingList.findUnique({
          where: {
            menteeId: mentee.id,
          },

          select: {
            status: true,
          },
        });

      /*
       * NOTIFIED means an admin has already been told about
       * this current waiting period. Do not send duplicate
       * notifications every time the dashboard requests matching.
       */
      if (existingWaitingEntry?.status !== WaitingStatus.NOTIFIED) {
        await this.prisma.menteeWaitingList.upsert({
          where: {
            menteeId: mentee.id,
          },

          update: {
            status: WaitingStatus.WAITING,
            notifiedAdminAt: null,
          },

          create: {
            menteeId: mentee.id,
            status: WaitingStatus.WAITING,
          },
        });

        const adminNotified = await this.notifyAdminsAboutWaitingMentee({
          menteeFullName: mentee.user.fullName,
          menteeEmail: mentee.user.email,
          menteeId: mentee.id,
        });

        /*
         * Only mark the waiting entry as NOTIFIED after
         * the email operation succeeds.
         *
         * A failed email deliberately leaves the row WAITING,
         * allowing a later request to retry the notification.
         */
        if (adminNotified) {
          await this.prisma.menteeWaitingList.update({
            where: {
              menteeId: mentee.id,
            },

            data: {
              status: WaitingStatus.NOTIFIED,
              notifiedAdminAt: new Date(),
            },
          });
        }
      }

      return {
        status: 'WAITING' as const,
        matchId: null,
      };
    }

    const bestMatch = recommendations[0];

    if (!bestMatch) {
      throw new ConflictException('Unable to select a mentor recommendation.');
    }

    return {
      status: 'RECOMMENDED' as const,
      recommendation: bestMatch,
    };
  }

  async proposeChemistry(userId: string, mentorId: string) {
    const mentee = await this.prisma.menteeProfile.findUnique({
      where: {
        userId,
      },

      include: {
        user: {
          select: {
            fullName: true,
          },
        },

        goalDisciplines: {
          include: {
            discipline: true,
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
      },
    });

    if (!mentee) {
      throw new NotFoundException('Mentee profile not found');
    }

    const existingMatch = await this.prisma.matches.findFirst({
      where: {
        menteeId: mentee.id,

        status: {
          in: CAPACITY_RELEVANT_STATUSES,
        },
      },
    });

    if (existingMatch) {
      throw new ConflictException(
        'The mentee already has a current mentorship engagement.',
      );
    }

    const recommendations =
      await this.matchingAlgoService.findBestMatches(userId);

    const selectedRecommendation = recommendations.find(
      (recommendation) => recommendation.mentorId === mentorId,
    );

    if (!selectedRecommendation) {
      throw new ConflictException(
        'This mentor is no longer available for matching.',
      );
    }

    const mentor = await this.prisma.mentorProfile.findUnique({
      where: {
        id: mentorId,
      },

      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },

        mentorDisciplines: {
          include: {
            discipline: true,
          },
        },

        mentorSkills: {
          include: {
            skill: true,
          },
        },

        mentorDomainIndustries: {
          include: {
            industry: true,
          },
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor profile not found');
    }

    const now = new Date();

    const proposalExpiresAt = this.getProposalExpiry();

    const menteeSnapshot = this.buildMenteeSnapshot(mentee);

    const mentorSnapshot = this.buildMentorSnapshot(mentor);

    const result = await this.prisma.$transaction(async (tx) => {
      const match = await tx.matches.create({
        data: {
          menteeId: mentee.id,
          mentorId: mentor.id,

          menteeSnapshot,
          mentorSnapshot,

          scores: selectedRecommendation.score,

          status: MatchStatus.CHEMISTRY_PENDING,

          menteeAcceptedAt: now,
          chemistryMenteeConfirmedAt: now,

          proposalExpiresAt,
        },
      });

      await tx.menteeWaitingList.updateMany({
        where: {
          menteeId: mentee.id,
        },

        data: {
          status: WaitingStatus.MATCHED,
        },
      });

      return {
        status: 'CHEMISTRY_PENDING' as const,
        matchId: match.id,
      };
    });

    try {
      await this.mailService.sendChemistryProposalEmail({
        email: mentor.user.email,
        mentorFullName: mentor.user.fullName,
        menteeFullName: mentee.user.fullName,
      });
    } catch (error) {
      this.logger.error(
        `Chemistry proposal email could not be sent for match ${result.matchId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return result;
  }
}
