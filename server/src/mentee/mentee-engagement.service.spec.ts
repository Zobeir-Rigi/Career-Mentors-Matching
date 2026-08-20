import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

import { MenteeEngagementService } from './mentee-engagement.service';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';

describe('MenteeEngagementService', () => {
  let service: MenteeEngagementService;

  const prismaMock = {
    matches: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenteeEngagementService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MenteeEngagementService>(MenteeEngagementService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rejects booking before the mentor accepts the chemistry proposal', async () => {
    prismaMock.matches.findFirst.mockResolvedValue({
      id: 'engagement-id',
      status: MatchStatus.CHEMISTRY_PENDING,
      menteeAcceptedAt: new Date('2026-08-20T12:00:00.000Z'),
      chemistryBookedAt: null,
    });

    const action = service.bookChemistry('mentee-user-id', 'engagement-id');

    await expect(action).rejects.toThrow(ConflictException);

    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });

  it('records chemistry booking without changing the confirmed status or check-in date', async () => {
    const now = new Date('2026-08-21T12:00:00.000Z');
    const scheduledCheckIn = new Date('2026-08-27T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    const engagement = {
      id: 'engagement-id',
      status: MatchStatus.CHEMISTRY_CONFIRMED,
      menteeAcceptedAt: new Date('2026-08-19T12:00:00.000Z'),
      chemistryBookedAt: null,
      scheduledCheckIn,
    };

    const bookedEngagement = {
      ...engagement,
      chemistryBookedAt: now,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);
    prismaMock.matches.update.mockResolvedValue(bookedEngagement);

    const result = await service.bookChemistry(
      'mentee-user-id',
      'engagement-id',
    );

    expect(prismaMock.matches.update).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
      },
      data: {
        chemistryBookedAt: now,
      },
    });

    expect(result).toEqual(bookedEngagement);
  });
});
