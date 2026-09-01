import { Test, TestingModule } from '@nestjs/testing';

import { MatchingLifecycleService } from './matching-lifecycle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { MatchStatus } from '../../generated/prisma/enums';

describe('MatchingLifecycleService', () => {
  let service: MatchingLifecycleService;

  const prismaMock = {
    matches: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mailServiceMock = {
    sendMentorshipCheckInEmail: jest.fn(),
    sendMatchExpiredEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingLifecycleService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
      ],
    }).compile();

    service = module.get<MatchingLifecycleService>(MatchingLifecycleService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves a due chemistry-confirmed match to match pending and emails both people', async () => {
    const now = new Date('2026-08-27T12:00:00.000Z');
    const checkInExpiresAt = new Date('2026-09-03T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaMock.matches.findMany.mockResolvedValue([
      {
        id: 'match-id',
        status: MatchStatus.CHEMISTRY_CONFIRMED,
        scheduledCheckIn: now,
        menteeProfile: {
          user: {
            email: 'casey@example.com',
            fullName: 'Casey Morgan',
          },
        },
        mentorProfile: {
          user: {
            email: 'amina@example.com',
            fullName: 'Amina Patel',
          },
        },
      },
    ]);

    prismaMock.matches.updateMany.mockResolvedValue({
      count: 1,
    });

    await service.processDueCheckIns();

    expect(prismaMock.matches.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'match-id',
        status: MatchStatus.CHEMISTRY_CONFIRMED,
        scheduledCheckIn: {
          lte: now,
        },
      },
      data: {
        status: MatchStatus.MATCH_PENDING,
        checkInExpiresAt,
      },
    });

    expect(mailServiceMock.sendMentorshipCheckInEmail).toHaveBeenCalledWith({
      email: 'casey@example.com',
      fullName: 'Casey Morgan',
      counterpartFullName: 'Amina Patel',
      recipientRole: 'mentee',
    });

    expect(mailServiceMock.sendMentorshipCheckInEmail).toHaveBeenCalledWith({
      email: 'amina@example.com',
      fullName: 'Amina Patel',
      counterpartFullName: 'Casey Morgan',
      recipientRole: 'mentor',
    });

    expect(mailServiceMock.sendMentorshipCheckInEmail).toHaveBeenCalledTimes(2);
  });

  it('does not email when another worker already processed the match', async () => {
    const now = new Date('2026-08-27T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaMock.matches.findMany.mockResolvedValue([
      {
        id: 'match-id',
        status: MatchStatus.CHEMISTRY_CONFIRMED,
        scheduledCheckIn: now,
        menteeProfile: {
          user: {
            email: 'casey@example.com',
            fullName: 'Casey Morgan',
          },
        },
        mentorProfile: {
          user: {
            email: 'amina@example.com',
            fullName: 'Amina Patel',
          },
        },
      },
    ]);

    prismaMock.matches.updateMany.mockResolvedValue({
      count: 0,
    });

    await service.processDueCheckIns();

    expect(mailServiceMock.sendMentorshipCheckInEmail).not.toHaveBeenCalled();
  });

  it('expires an unanswered chemistry proposal', async () => {
    const now = new Date('2026-08-27T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaMock.matches.findMany.mockResolvedValue([
      {
        id: 'match-id',
      },
    ]);

    prismaMock.matches.updateMany.mockResolvedValue({
      count: 1,
    });

    await service.processExpiredChemistryProposals();

    expect(prismaMock.matches.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'match-id',
        status: MatchStatus.CHEMISTRY_PENDING,
        proposalExpiresAt: {
          lte: now,
        },
      },
      data: {
        status: MatchStatus.DECLINED,
        declinedAt: now,
        proposalExpiresAt: null,
      },
    });
  });

  it('expires an unanswered final check-in', async () => {
    const now = new Date('2026-09-03T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaMock.matches.findMany.mockResolvedValue([
      {
        id: 'match-id',
        menteeProfile: {
          user: { email: 'casey@example.com', fullName: 'Casey Morgan' },
        },
        mentorProfile: {
          user: { email: 'amina@example.com', fullName: 'Amina Patel' },
        },
      },
    ]);

    prismaMock.matches.updateMany.mockResolvedValue({
      count: 1,
    });

    await service.processExpiredCheckIns();

    expect(prismaMock.matches.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'match-id',
        status: MatchStatus.MATCH_PENDING,
        checkInExpiresAt: {
          lte: now,
        },
        OR: [
          {
            checkInMenteeAgreed: null,
          },
          {
            checkInMentorAgreed: null,
          },
        ],
      },
      data: {
        status: MatchStatus.DECLINED,
        declinedAt: now,
        checkInExpiresAt: null,
      },
    });

    expect(mailServiceMock.sendMatchExpiredEmail).toHaveBeenNthCalledWith(1, {
      email: 'casey@example.com',
      fullName: 'Casey Morgan',
      counterpartFullName: 'Amina Patel',
      recipientRole: 'mentee',
    });
    expect(mailServiceMock.sendMatchExpiredEmail).toHaveBeenNthCalledWith(2, {
      email: 'amina@example.com',
      fullName: 'Amina Patel',
      counterpartFullName: 'Casey Morgan',
      recipientRole: 'mentor',
    });
  });
});
