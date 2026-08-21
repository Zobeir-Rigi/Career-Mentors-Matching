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
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
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

  it('activates mentorship when mentee agrees and mentor already agreed', async () => {
    const engagement = {
      id: 'engagement-id',
      menteeId: 'mentee-profile-id',
      status: MatchStatus.MATCH_PENDING,
      checkInMenteeAgreed: null,
      checkInMentorAgreed: true,
    };

    const activeEngagement = {
      ...engagement,
      status: MatchStatus.ACTIVE,
      checkInMenteeAgreed: true,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        callback(prismaMock),
    );

    prismaMock.matches.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.matches.findUniqueOrThrow.mockResolvedValue(activeEngagement);

    const result = await service.respondToCheckIn(
      'mentee-user-id',
      'engagement-id',
      true,
    );

    expect(prismaMock.matches.update).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
      },
      data: {
        checkInMenteeAgreed: true,
      },
    });

    expect(prismaMock.matches.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
        status: MatchStatus.MATCH_PENDING,
        checkInMenteeAgreed: true,
        checkInMentorAgreed: true,
      },
      data: {
        status: MatchStatus.ACTIVE,
        checkInExpiresAt: null,
      },
    });

    expect(result).toEqual(activeEngagement);
  });

  it('declines mentorship when mentee rejects the final check-in', async () => {
    const now = new Date('2026-09-01T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    const engagement = {
      id: 'engagement-id',
      menteeId: 'mentee-profile-id',
      status: MatchStatus.MATCH_PENDING,
      checkInMenteeAgreed: null,
      checkInMentorAgreed: true,
    };

    const declinedEngagement = {
      ...engagement,
      status: MatchStatus.DECLINED,
      checkInMenteeAgreed: false,
      declinedAt: now,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        callback(prismaMock),
    );

    prismaMock.matches.update.mockResolvedValue(declinedEngagement);

    const result = await service.respondToCheckIn(
      'mentee-user-id',
      'engagement-id',
      false,
    );

    expect(prismaMock.matches.update).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
      },
      data: {
        checkInMenteeAgreed: false,
        status: MatchStatus.DECLINED,
        declinedAt: now,
        checkInExpiresAt: null,
      },
    });

    expect(result).toEqual(declinedEngagement);
  });
});
