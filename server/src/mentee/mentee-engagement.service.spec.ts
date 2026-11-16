import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

import { MenteeEngagementService } from './mentee-engagement.service';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';
import { MailService } from '../mail/mail.service';

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

  // Supply a mock notification sender when creating the service in tests.
  const mailServiceMock = {
    notifyMentorshipStarted: jest.fn(),
  };

  const pendingCheckIn = {
    id: 'engagement-id',
    menteeId: 'mentee-profile-id',
    status: MatchStatus.MATCH_PENDING,
    checkInMenteeAgreed: null,
    checkInMentorAgreed: true,
    menteeProfile: {
      user: { email: 'casey@example.com', fullName: 'Casey Morgan' },
    },
    mentorProfile: {
      user: { email: 'amina@example.com', fullName: 'Amina Patel' },
    },
  };

  const activeEngagement = {
    ...pendingCheckIn,
    status: MatchStatus.ACTIVE,
    checkInMenteeAgreed: true,
    checkInExpiresAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenteeEngagementService,
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

    service = module.get<MenteeEngagementService>(MenteeEngagementService);

    jest.resetAllMocks();
    mailServiceMock.notifyMentorshipStarted.mockResolvedValue(undefined);
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
    prismaMock.matches.findFirst.mockResolvedValue(pendingCheckIn);

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
        const result = await callback(prismaMock);

        expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();

        return result;
      },
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
    expect(mailServiceMock.notifyMentorshipStarted).toHaveBeenCalledTimes(1);
    expect(mailServiceMock.notifyMentorshipStarted).toHaveBeenCalledWith({
      mentor: { email: 'amina@example.com', fullName: 'Amina Patel' },
      mentee: { email: 'casey@example.com', fullName: 'Casey Morgan' },
    });
  });

  describe('mentorship started notifications', () => {
    beforeEach(() => {
      prismaMock.matches.findFirst.mockResolvedValue(pendingCheckIn);
      prismaMock.matches.update.mockResolvedValue({
        ...pendingCheckIn,
        checkInMenteeAgreed: true,
      });
      prismaMock.matches.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.matches.findUniqueOrThrow.mockResolvedValue(activeEngagement);
      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );
    });

    it.each([MatchStatus.MATCH_PENDING, MatchStatus.ACTIVE])(
      'does not notify when activation updates no rows and the returned match is %s',
      async (status) => {
        prismaMock.matches.updateMany.mockResolvedValue({ count: 0 });
        const updatedEngagement = {
          ...activeEngagement,
          status,
          checkInMentorAgreed:
            status === MatchStatus.MATCH_PENDING ? null : true,
        };
        prismaMock.matches.findUniqueOrThrow.mockResolvedValue(
          updatedEngagement,
        );

        const result = await service.respondToCheckIn(
          'mentee-user-id',
          'engagement-id',
          true,
        );

        expect(result).toEqual(updatedEngagement);
        expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();
      },
    );

    it('notifies only once when overlapping requests read the same pending match', async () => {
      prismaMock.matches.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 });

      const results = await Promise.all([
        service.respondToCheckIn('mentee-user-id', 'engagement-id', true),
        service.respondToCheckIn('mentee-user-id', 'engagement-id', true),
      ]);

      expect(results).toEqual([activeEngagement, activeEngagement]);
      expect(prismaMock.matches.updateMany).toHaveBeenCalledTimes(2);
      expect(mailServiceMock.notifyMentorshipStarted).toHaveBeenCalledTimes(1);
    });

    it('does not notify if the transaction fails after attempting activation', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
          await callback(prismaMock);
          throw new Error('Transaction could not commit');
        },
      );

      await expect(
        service.respondToCheckIn('mentee-user-id', 'engagement-id', true),
      ).rejects.toThrow('Transaction could not commit');

      expect(prismaMock.matches.updateMany).toHaveBeenCalledTimes(1);
      expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();
    });

    it('does not notify again when the mentee has already responded', async () => {
      const answeredEngagement = {
        ...pendingCheckIn,
        checkInMenteeAgreed: true,
      };
      prismaMock.matches.findFirst.mockResolvedValue(answeredEngagement);

      const result = await service.respondToCheckIn(
        'mentee-user-id',
        'engagement-id',
        true,
      );

      expect(result).toEqual(answeredEngagement);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();
    });

    it('does not notify again when the mentorship is already active', async () => {
      prismaMock.matches.findFirst.mockResolvedValue(activeEngagement);

      await expect(
        service.respondToCheckIn('mentee-user-id', 'engagement-id', true),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();
    });
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
    expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();
  });
});
