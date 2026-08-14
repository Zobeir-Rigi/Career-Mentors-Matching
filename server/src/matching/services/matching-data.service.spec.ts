import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalStatus, MatchStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchingDataService } from './matching-data.service';

describe('MatchingDataService', () => {
  let service: MatchingDataService;
  let prisma: PrismaService;

  const mockPrismaService = {
    menteeProfile: { findUnique: jest.fn() },
    matchingConfig: { findFirst: jest.fn() },
    mentorProfile: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingDataService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get(MatchingDataService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('fetchMenteeContextByUserId', () => {
    it('fetches all data needed by the scoring algorithm', async () => {
      const mentee = { id: 'mentee-1', userId: 'user-mentee-1', matches: [] };
      mockPrismaService.menteeProfile.findUnique.mockResolvedValue(mentee);

      await expect(
        service.fetchMenteeContextByUserId('user-mentee-1'),
      ).resolves.toBe(mentee);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.menteeProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-mentee-1' },
        include: {
          goalDisciplines: { include: { discipline: true } },
          wantedSkills: { include: { skill: true } },
          targetedIndustries: { include: { industry: true } },
          matches: { select: { mentorId: true, status: true } },
        },
      });
    });

    it('throws when the mentee does not exist', async () => {
      mockPrismaService.menteeProfile.findUnique.mockResolvedValue(null);
      await expect(
        service.fetchMenteeContextByUserId('missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('fetchActiveConfig', () => {
    it('returns the newest active configuration', async () => {
      const config = { id: 'config-1', isActive: true };
      mockPrismaService.matchingConfig.findFirst.mockResolvedValue(config);

      await expect(service.fetchActiveConfig()).resolves.toBe(config);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.matchingConfig.findFirst).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('fetchEligibleCandidates', () => {
    it('fetches only approved/accepting mentors and only capacity-relevant matches', async () => {
      mockPrismaService.mentorProfile.findMany.mockResolvedValue([]);

      await service.fetchEligibleCandidates(['mentor-old', 'mentor-old']);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.mentorProfile.findMany).toHaveBeenCalledWith({
        where: {
          approvalStatus: ApprovalStatus.ACCEPTED,
          isAcceptingMentees: true,
          id: { notIn: ['mentor-old'] },
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
              status: {
                in: [
                  MatchStatus.CHEMISTRY_PENDING,
                  MatchStatus.CHEMISTRY_CONFIRMED,
                  MatchStatus.MATCH_PENDING,
                  MatchStatus.ACTIVE,
                ],
              },
            },
            select: { status: true },
          },
        },
      });
    });
  });
});
