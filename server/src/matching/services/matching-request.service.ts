import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MatchStatus, WaitingStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { MatchingAlgoService } from './matching-algo.service';

import { CAPACITY_RELEVANT_STATUSES } from '@/common/constants/capacity-relevant-statuses';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingAlgoService: MatchingAlgoService,
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

  async requestMatch(userId: string) {
    const mentee = await this.prisma.menteeProfile.findUnique({
      where: {
        userId,
      },
      include: {
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

    /*
     * Idempotency:
     * if this mentee already has a current/proposed engagement,
     * don't create another one.
     */
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
        status: 'MATCHED',
        matchId: existingMatch.id,
      };
    }

    const recommendations =
      await this.matchingAlgoService.findBestMatches(userId);

    /*
     * No suitable mentor?:
     * put the mentee on the waiting list.
     *
     * upsert makes repeated requests idempotent.
     */
    if (recommendations.length === 0) {
      await this.prisma.menteeWaitingList.upsert({
        where: {
          menteeId: mentee.id,
        },
        update: {
          status: WaitingStatus.WAITING,
        },
        create: {
          menteeId: mentee.id,
          status: WaitingStatus.WAITING,
        },
      });

      return {
        status: 'WAITING' as const,
        matchId: null,
      };
    }

    /*
     * Recommendations are already sorted highest score first.
     * MVP proposes one mentor rather than exposing the entire ranked list.
     */
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

    // Re-run matching immediately before creating the chemistry proposal.
    // This makes sure the selected mentor is still eligible and has capacity.
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

    return this.prisma.$transaction(async (tx) => {
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
  }

  async switchProposal(userId: string, mentorId: string) {
    const mentee = await this.prisma.menteeProfile.findUnique({
      where: { userId },
    });

    if (!mentee) {
      throw new NotFoundException('Mentee profile not found');
    }

    const currentMatch = await this.prisma.matches.findFirst({
      where: {
        menteeId: mentee.id,
        status: MatchStatus.CHEMISTRY_PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!currentMatch) {
      throw new NotFoundException('Current mentor proposal not found');
    }

    if (currentMatch.menteeAcceptedAt) {
      throw new ConflictException(
        'The current proposal has already been accepted and cannot be replaced.',
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
        id: selectedRecommendation.mentorId,
      },
      include: {
        user: {
          select: {
            fullName: true,
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
      throw new NotFoundException('Matched mentor profile not found');
    }

    const menteeWithRelations = await this.prisma.menteeProfile.findUnique({
      where: {
        id: mentee.id,
      },
      include: {
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

    if (!menteeWithRelations) {
      throw new NotFoundException('Mentee profile not found');
    }

    const now = new Date();

    const proposalExpiresAt = this.getProposalExpiry();

    const menteeSnapshot = this.buildMenteeSnapshot(menteeWithRelations);

    const mentorSnapshot = this.buildMentorSnapshot(mentor);

    return this.prisma.$transaction(async (tx) => {
      await tx.matches.update({
        where: {
          id: currentMatch.id,
        },
        data: {
          status: MatchStatus.DECLINED,
          declinedAt: now,
        },
      });

      const newMatch = await tx.matches.create({
        data: {
          menteeId: mentee.id,
          mentorId: mentor.id,
          menteeSnapshot,
          mentorSnapshot,
          scores: selectedRecommendation.score,
          status: MatchStatus.CHEMISTRY_PENDING,
          proposalExpiresAt,
        },
      });

      return {
        status: 'MATCHED' as const,
        matchId: newMatch.id,
      };
    });
  }
}
