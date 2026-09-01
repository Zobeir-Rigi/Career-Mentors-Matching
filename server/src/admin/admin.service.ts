import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '@/prisma/prisma.service';
import { ApprovalStatus, WaitingStatus } from '@/generated/prisma/enums';

import { AdminMenteesResponseDto } from './dto/admin-mentees-response.dto';
import { AdminMentorsResponseDto } from './dto/admin-mentors-response.dto';
import { AdminOverviewResponseDto } from './dto/admin-overview-response.dto';
import { CAPACITY_RELEVANT_STATUSES } from '@/common/constants/capacity-relevant-statuses';
import { AdminDirectoryQueryDto } from './dto/admin-directory-query.dto';
import { buildDirectorySearch } from './helpers/build-directory-search';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async getMentees(
    query: AdminDirectoryQueryDto,
  ): Promise<AdminMenteesResponseDto> {
    try {
      const { search, page, limit } = query;
      const skip = (page - 1) * limit;

      const where = buildDirectorySearch(search, 'goalDisciplines');

      const [mentees, total] = await Promise.all([
        this.prisma.menteeProfile.findMany({
          where,
          skip,
          take: limit,

          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                role: true,
                email: true,
                createdAt: true,
                linkedinURL: true,
              },
            },

            matches: {
              where: {
                status: {
                  in: CAPACITY_RELEVANT_STATUSES,
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
              select: {
                id: true,
                status: true,
                scores: true,
                createdAt: true,
                declinedAt: true,

                mentorProfile: {
                  select: {
                    id: true,
                    user: {
                      select: {
                        fullName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
            region: true,
            availability: true,
            goalDisciplines: {
              select: {
                discipline: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        }),

        this.prisma.menteeProfile.count({
          where,
        }),
      ]);

      const menteesData = mentees.map((mentee) => {
        const user = mentee?.user;
        const matches = mentee.matches ?? [];
        const currentMatch = matches[0] ?? null;
        const menteeGoalDisciplines = mentee.goalDisciplines ?? [];
        return {
          menteeProfileId: mentee.id,

          fullName: user?.fullName ?? '',
          role: user?.role ?? null,
          email: user?.email ?? '',
          region: mentee?.region ?? null,
          availability: mentee?.availability ?? [],
          createdAt: user?.createdAt ?? null,
          links: user?.linkedinURL ?? null,

          goals: menteeGoalDisciplines
            .map((md) => md?.discipline?.name)
            .filter((name): name is string => Boolean(name)),

          mentor: currentMatch
            ? {
                mentorProfileId: currentMatch.mentorProfile.id,
                fullName: currentMatch.mentorProfile.user.fullName,
                email: currentMatch.mentorProfile.user.email,
              }
            : null,

          status: currentMatch?.status ?? null,

          matches: matches.map((match) => ({
            status: match?.status ?? null,
            score: match?.scores ?? null,
            fullName: match?.mentorProfile?.user?.fullName ?? '',
            createdAt: match?.createdAt ?? null,
            declinedAt: match?.declinedAt ?? null,
          })),
        };
      });
      return plainToInstance(AdminMenteesResponseDto, {
        mentees: menteesData,
        total,
        page,
        limit,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMentors(
    query: AdminDirectoryQueryDto,
  ): Promise<AdminMentorsResponseDto> {
    try {
      const { search, page, limit } = query;
      const skip = (page - 1) * limit;

      const where = buildDirectorySearch(search, 'mentorDisciplines');

      const [mentors, total] = await Promise.all([
        this.prisma.mentorProfile.findMany({
          where,
          skip,
          take: limit,

          select: {
            id: true,
            currentJobTitle: true,
            capacity: true,
            approvalStatus: true,
            region: true,
            availability: true,
            bio: true,

            user: {
              select: {
                fullName: true,
                email: true,
                createdAt: true,
                linkedinURL: true,
              },
            },

            matches: {
              where: {
                status: {
                  in: CAPACITY_RELEVANT_STATUSES,
                },
              },
              select: {
                id: true,
                status: true,
                scores: true,
                createdAt: true,
                declinedAt: true,

                menteeProfile: {
                  select: {
                    id: true,

                    user: {
                      select: {
                        fullName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },

            mentorDisciplines: {
              select: {
                discipline: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        }),

        this.prisma.mentorProfile.count({
          where,
        }),
      ]);

      const mentorsData = mentors.map((mentor) => {
        const user = mentor?.user;
        const matches = mentor.matches ?? [];
        const mentorDisciplines = mentor.mentorDisciplines ?? [];

        return {
          mentorProfileId: mentor.id,

          fullName: user?.fullName ?? '',
          currentJobTitle: mentor.currentJobTitle,
          approvalStatus: mentor.approvalStatus,

          disciplines: mentorDisciplines
            .map((md) => md?.discipline?.name)
            .filter((name): name is string => Boolean(name)),

          email: user?.email ?? '',
          bio: mentor?.bio ?? '',
          capacity: {
            filled: matches.length,
            total: mentor.capacity,
            isFull: matches.length >= mentor.capacity,
          },
          region: mentor?.region ?? null,
          availability: mentor?.availability ?? [],
          createdAt: user?.createdAt ?? null,
          linkedinURL: user?.linkedinURL ?? null,

          matchedMentees: matches.map((match) => ({
            menteeProfileId: match.menteeProfile.id,
            fullName: match.menteeProfile.user.fullName,
            email: match.menteeProfile.user.email,
            score: match.scores,
          })),

          matches: matches.map((match) => ({
            status: match?.status ?? null,
            score: match?.scores ?? null,
            fullName: match?.menteeProfile?.user?.fullName ?? '',
            createdAt: match?.createdAt ?? null,
            declinedAt: match?.declinedAt ?? null,
          })),
        };
      });

      return plainToInstance(AdminMentorsResponseDto, {
        mentors: mentorsData,
        total,
        page,
        limit,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getOverview(): Promise<AdminOverviewResponseDto> {
    const [
      volunteerMentors,
      liveMatches,
      waitingList,
      acceptingMentors,
      matchedPairs,
      pendingMentors,
    ] = await Promise.all([
      this.prisma.mentorProfile.count({
        where: {
          approvalStatus: ApprovalStatus.ACCEPTED,
        },
      }),

      this.prisma.matches.count({
        where: {
          status: {
            in: CAPACITY_RELEVANT_STATUSES,
          },
        },
      }),

      this.prisma.menteeWaitingList.findMany({
        where: {
          status: {
            in: [WaitingStatus.WAITING, WaitingStatus.NOTIFIED],
          },
        },
        include: {
          menteeProfile: {
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
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prisma.mentorProfile.findMany({
        where: {
          approvalStatus: ApprovalStatus.ACCEPTED,
          isAcceptingMentees: true,
        },
        select: {
          capacity: true,
          matches: {
            where: {
              status: {
                in: CAPACITY_RELEVANT_STATUSES,
              },
            },
            select: {
              id: true,
            },
          },
        },
      }),

      this.prisma.matches.findMany({
        where: {
          status: {
            in: CAPACITY_RELEVANT_STATUSES,
          },
        },
        select: {
          id: true,
          status: true,
          menteeProfile: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          mentorProfile: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.mentorProfile.count({
        where: {
          approvalStatus: ApprovalStatus.PENDING,
        },
      }),
    ]);

    const openMenteePlaces = acceptingMentors.reduce((total, mentor) => {
      const availablePlaces = Math.max(
        mentor.capacity - mentor.matches.length,
        0,
      );
      return total + availablePlaces;
    }, 0);

    const waitingMentees = waitingList
      .filter((entry) => entry.menteeProfile)
      .map((entry) => ({
        id: entry.menteeProfile!.id,
        fullName: entry.menteeProfile!.user.fullName,
        email: entry.menteeProfile!.user.email,
        goals: entry.menteeProfile!.goalDisciplines.map(
          (goal) => goal.discipline.name,
        ),
        waitingSince: entry.createdAt,
      }));

    const currentMatchedPairs = matchedPairs.map((match) => ({
      matchId: match.id,

      mentee: {
        id: match.menteeProfile.id,
        fullName: match.menteeProfile.user.fullName,
        email: match.menteeProfile.user.email,
      },

      mentor: {
        id: match.mentorProfile.id,
        fullName: match.mentorProfile.user.fullName,
        email: match.mentorProfile.user.email,
      },

      status: match.status,
    }));

    return {
      volunteerMentors,
      openMenteePlaces,
      liveMatches,
      menteesWaiting: waitingMentees.length,
      waitingMentees,
      matchedPairs: currentMatchedPairs,
      pendingMentors,
    };
  }

  async updateMentorApproval(
    mentorProfileId: string,
    approvalStatus: ApprovalStatus,
  ) {
    try {
      const existingMentor = await this.prisma.mentorProfile.findUnique({
        where: {
          id: mentorProfileId,
        },
        select: {
          approvalStatus: true,
        },
      });

      if (!existingMentor) {
        throw new Error('Mentor profile not found');
      }

      const isDecisionChange =
        existingMentor.approvalStatus !== approvalStatus &&
        (approvalStatus === ApprovalStatus.ACCEPTED ||
          approvalStatus === ApprovalStatus.DECLINED);

      const mentor = await this.prisma.mentorProfile.update({
        where: {
          id: mentorProfileId,
        },
        data: {
          approvalStatus,
          ...(isDecisionChange && {
            approvalDecisionEmailSentAt: null,
          }),
        },
        select: {
          id: true,
          approvalStatus: true,
          currentJobTitle: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      if (isDecisionChange) {
        try {
          await this.mailService.sendMentorApprovalDecisionEmail({
            email: mentor.user.email,
            fullName: mentor.user.fullName,
            approvalStatus,
          });

          await this.prisma.mentorProfile.update({
            where: {
              id: mentor.id,
            },
            data: {
              approvalDecisionEmailSentAt: new Date(),
            },
          });
        } catch (error) {
          this.logger.error(
            `Mentor approval decision email could not be sent for mentor ${mentor.id}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }

      return mentor;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
