import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

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
    sendChemistryProposalExpiredEmail: jest.fn(),
  };

  const expiredProposal = {
    id: 'match-id',
    menteeProfile: {
      user: { email: 'casey@example.com', fullName: 'Casey Morgan' },
    },
    mentorProfile: {
      user: { email: 'amina@example.com', fullName: 'Amina Patel' },
    },
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

    jest.resetAllMocks();
    mailServiceMock.sendChemistryProposalExpiredEmail.mockResolvedValue(
      undefined,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
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

  it('expires an unanswered chemistry proposal and emails both people', async () => {
    const now = new Date('2026-08-27T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaMock.matches.findMany.mockResolvedValue([expiredProposal]);

    prismaMock.matches.updateMany.mockResolvedValue({
      count: 1,
    });

    await service.processExpiredChemistryProposals();

    expect(prismaMock.matches.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: MatchStatus.CHEMISTRY_PENDING,
          proposalExpiresAt: { lte: now },
        },
      }),
    );
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

    expect(
      mailServiceMock.sendChemistryProposalExpiredEmail,
    ).toHaveBeenCalledTimes(2);
    expect(
      mailServiceMock.sendChemistryProposalExpiredEmail,
    ).toHaveBeenNthCalledWith(1, {
      email: 'casey@example.com',
      recipientFullName: 'Casey Morgan',
      counterpartFullName: 'Amina Patel',
      recipientRole: 'mentee',
    });
    expect(
      mailServiceMock.sendChemistryProposalExpiredEmail,
    ).toHaveBeenNthCalledWith(2, {
      email: 'amina@example.com',
      recipientFullName: 'Amina Patel',
      counterpartFullName: 'Casey Morgan',
      recipientRole: 'mentor',
    });
    expect(mailServiceMock.sendMatchExpiredEmail).not.toHaveBeenCalled();
  });

  it('does nothing when no chemistry proposals are overdue', async () => {
    prismaMock.matches.findMany.mockResolvedValue([]);

    await service.processExpiredChemistryProposals();

    expect(prismaMock.matches.updateMany).not.toHaveBeenCalled();
    expect(
      mailServiceMock.sendChemistryProposalExpiredEmail,
    ).not.toHaveBeenCalled();
  });

  it('does not email if the proposal was accepted or expired by another worker', async () => {
    prismaMock.matches.findMany.mockResolvedValue([expiredProposal]);
    prismaMock.matches.updateMany.mockResolvedValue({ count: 0 });

    await service.processExpiredChemistryProposals();

    expect(
      mailServiceMock.sendChemistryProposalExpiredEmail,
    ).not.toHaveBeenCalled();
  });

  it('does not send duplicate emails when an expiry job processes the same result again', async () => {
    prismaMock.matches.findMany.mockResolvedValue([expiredProposal]);
    prismaMock.matches.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await service.processExpiredChemistryProposals();
    await service.processExpiredChemistryProposals();

    expect(prismaMock.matches.updateMany).toHaveBeenCalledTimes(2);
    expect(
      mailServiceMock.sendChemistryProposalExpiredEmail,
    ).toHaveBeenCalledTimes(2);
  });

  it('still emails the mentor when the mentee expiry email fails', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    prismaMock.matches.findMany.mockResolvedValue([expiredProposal]);
    prismaMock.matches.updateMany.mockResolvedValue({ count: 1 });
    mailServiceMock.sendChemistryProposalExpiredEmail.mockRejectedValueOnce(
      new Error('SES unavailable'),
    );

    await expect(
      service.processExpiredChemistryProposals(),
    ).resolves.toBeUndefined();

    expect(
      mailServiceMock.sendChemistryProposalExpiredEmail,
    ).toHaveBeenCalledTimes(2);
    expect(
      mailServiceMock.sendChemistryProposalExpiredEmail,
    ).toHaveBeenNthCalledWith(2, {
      email: 'amina@example.com',
      recipientFullName: 'Amina Patel',
      counterpartFullName: 'Casey Morgan',
      recipientRole: 'mentor',
    });
    expect(logSpy).toHaveBeenCalled();
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
