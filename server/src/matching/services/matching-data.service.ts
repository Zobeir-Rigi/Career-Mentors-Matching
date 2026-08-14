import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CAPACITY_RELEVANT_STATUSES } from '../../common/constants/capacity-relevant-statuses';

@Injectable()
export class MatchingDataService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchMenteeContextByUserId(userId: string) {
    const mentee = await this.prisma.menteeProfile.findUnique({
      where: { userId },
      include: {
        goalDisciplines: { include: { discipline: true } },
        wantedSkills: { include: { skill: true } },
        targetedIndustries: { include: { industry: true } },
        matches: { select: { mentorId: true, status: true } },
      },
    });

    if (!mentee) {
      throw new NotFoundException('Mentee not found');
    }

    return mentee;
  }

  async fetchActiveConfig() {
    return this.prisma.matchingConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async fetchEligibleCandidates(excludedMentorIds: readonly string[]) {
    return this.prisma.mentorProfile.findMany({
      where: {
        approvalStatus: ApprovalStatus.ACCEPTED,
        isAcceptingMentees: true,
        id: { notIn: [...new Set(excludedMentorIds)] },
      },
      include: {
        user: {
          select: {
            fullName: true,
            linkedinURL: true,
          },
        },
        mentorDisciplines: { include: { discipline: true } },
        mentorSkills: { include: { skill: true } },
        mentorDomainIndustries: { include: { industry: true } },
        matches: {
          where: {
            status: { in: CAPACITY_RELEVANT_STATUSES },
          },
          select: { status: true },
        },
      },
    });
  }
}
