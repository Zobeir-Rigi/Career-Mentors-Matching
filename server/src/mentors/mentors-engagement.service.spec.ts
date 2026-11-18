import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { MentorEngagementService } from './mentors-engagement.service';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';
import { MailService } from '../mail/mail.service';

describe('MentorEngagementService', () => {
  let service: MentorEngagementService;

  const prismaMock = {
    matches: {
      findFirst: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mailServiceMock = {
    sendChemistryAcceptedEmail: jest.fn(),
    notifyMentorshipStarted: jest.fn(),
    notifyMentorshipEnded: jest.fn(),
  };

  const pendingProposal = {
    id: 'engagement-id',
    status: MatchStatus.CHEMISTRY_PENDING,
    menteeAcceptedAt: new Date('2026-08-19T12:00:00.000Z'),
    chemistryMentorConfirmedAt: null,
    menteeProfile: {
      user: { email: 'casey@example.com', fullName: 'Casey Morgan' },
    },
    mentorProfile: {
      user: { fullName: 'Amina Patel' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorEngagementService,
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

    service = module.get<MentorEngagementService>(MentorEngagementService);

    jest.resetAllMocks();
    mailServiceMock.sendChemistryAcceptedEmail.mockResolvedValue(undefined);
    mailServiceMock.notifyMentorshipStarted.mockResolvedValue(undefined);
    mailServiceMock.notifyMentorshipEnded.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('declines a pre-active engagement', async () => {
    const now = new Date('2026-08-12T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    const engagement = {
      id: 'engagement-id',
      menteeId: 'mentee-profile-id',
      status: MatchStatus.CHEMISTRY_PENDING,
      declinedAt: null,
    };

    const declinedEngagement = {
      ...engagement,
      status: MatchStatus.DECLINED,
      declinedAt: now,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);
    prismaMock.matches.update.mockResolvedValue(declinedEngagement);

    const result = await service.decline('mentor-user-id', 'engagement-id');

    expect(prismaMock.matches.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
        mentorProfile: {
          userId: 'mentor-user-id',
        },
      },
      include: {
        menteeProfile: {
          include: {
            user: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
        mentorProfile: {
          include: {
            user: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    expect(prismaMock.matches.update).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
      },
      data: {
        status: MatchStatus.DECLINED,
        declinedAt: now,
      },
    });

    expect(result).toEqual(declinedEngagement);
  });

  it('is idempotent when engagement is already declined', async () => {
    const engagement = {
      id: 'engagement-id',
      status: MatchStatus.DECLINED,
      declinedAt: new Date(),
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);

    const result = await service.decline('mentor-user-id', 'engagement-id');

    expect(result).toEqual(engagement);
    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });

  it('rejects declining an active mentorship', async () => {
    prismaMock.matches.findFirst.mockResolvedValue({
      id: 'engagement-id',
      status: MatchStatus.ACTIVE,
    });

    await expect(
      service.decline('mentor-user-id', 'engagement-id'),
    ).rejects.toThrow(ConflictException);

    await expect(
      service.decline('mentor-user-id', 'engagement-id'),
    ).rejects.toThrow(
      'Active mentorship cannot be declined. End the mentorship instead.',
    );

    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });

  it('rejects declining a completed mentorship', async () => {
    prismaMock.matches.findFirst.mockResolvedValue({
      id: 'engagement-id',
      status: MatchStatus.COMPLETED,
    });

    await expect(
      service.decline('mentor-user-id', 'engagement-id'),
    ).rejects.toThrow(ConflictException);

    await expect(
      service.decline('mentor-user-id', 'engagement-id'),
    ).rejects.toThrow('Completed mentorship cannot be declined.');

    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when engagement is not owned by mentor', async () => {
    prismaMock.matches.findFirst.mockResolvedValue(null);

    await expect(
      service.decline('mentor-user-id', 'other-engagement-id'),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.decline('mentor-user-id', 'other-engagement-id'),
    ).rejects.toThrow('Mentor engagement not found');

    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });

  it('confirms chemistry when the mentor accepts the proposal', async () => {
    const now = new Date('2026-08-20T12:00:00.000Z');
    const scheduledCheckIn = new Date('2026-08-27T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    const engagement = {
      id: 'engagement-id',
      status: MatchStatus.CHEMISTRY_PENDING,
      menteeAcceptedAt: new Date('2026-08-19T12:00:00.000Z'),
      chemistryBookedAt: null,
      chemistryMentorConfirmedAt: null,
      chemistryMenteeConfirmedAt: new Date('2026-08-19T12:00:00.000Z'),
      menteeProfile: {
        user: {
          email: 'casey@example.com',
          fullName: 'Casey Morgan',
        },
      },
      mentorProfile: {
        user: {
          fullName: 'Amina Patel',
        },
      },
    };

    const confirmedEngagement = {
      ...engagement,
      status: MatchStatus.CHEMISTRY_CONFIRMED,
      chemistryMentorConfirmedAt: now,
      scheduledCheckIn,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);
    prismaMock.matches.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.matches.findUniqueOrThrow.mockResolvedValue(confirmedEngagement);

    const result = await service.confirm('mentor-user-id', 'engagement-id');

    expect(prismaMock.matches.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
        status: MatchStatus.CHEMISTRY_PENDING,
      },
      data: {
        status: MatchStatus.CHEMISTRY_CONFIRMED,
        chemistryMentorConfirmedAt: now,
        scheduledCheckIn,
        proposalExpiresAt: null,
      },
    });

    expect(result).toEqual(confirmedEngagement);

    expect(prismaMock.matches.update).not.toHaveBeenCalled();
    expect(mailServiceMock.sendChemistryAcceptedEmail).toHaveBeenCalledTimes(1);
    expect(mailServiceMock.sendChemistryAcceptedEmail).toHaveBeenCalledWith({
      email: 'casey@example.com',
      menteeFullName: 'Casey Morgan',
      mentorFullName: 'Amina Patel',
    });
  });

  it('still confirms chemistry when the acceptance email cannot be sent', async () => {
    const now = new Date('2026-08-20T12:00:00.000Z');
    const scheduledCheckIn = new Date('2026-08-27T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    const engagement = {
      id: 'engagement-id',
      status: MatchStatus.CHEMISTRY_PENDING,
      menteeAcceptedAt: new Date('2026-08-19T12:00:00.000Z'),
      chemistryBookedAt: null,
      chemistryMentorConfirmedAt: null,
      chemistryMenteeConfirmedAt: new Date('2026-08-19T12:00:00.000Z'),
      menteeProfile: {
        user: {
          email: 'casey@example.com',
          fullName: 'Casey Morgan',
        },
      },
      mentorProfile: {
        user: {
          fullName: 'Amina Patel',
        },
      },
    };

    const confirmedEngagement = {
      ...engagement,
      status: MatchStatus.CHEMISTRY_CONFIRMED,
      chemistryMentorConfirmedAt: now,
      scheduledCheckIn,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);
    prismaMock.matches.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.matches.findUniqueOrThrow.mockResolvedValue(confirmedEngagement);

    mailServiceMock.sendChemistryAcceptedEmail.mockRejectedValue(
      new Error('SES unavailable'),
    );

    const result = await service.confirm('mentor-user-id', 'engagement-id');

    expect(result).toEqual(confirmedEngagement);

    expect(prismaMock.matches.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
        status: MatchStatus.CHEMISTRY_PENDING,
      },
      data: {
        status: MatchStatus.CHEMISTRY_CONFIRMED,
        chemistryMentorConfirmedAt: now,
        scheduledCheckIn,
        proposalExpiresAt: null,
      },
    });
  });

  it('does not accept or email when expiry changed the proposal after it was read', async () => {
    prismaMock.matches.findFirst.mockResolvedValue(pendingProposal);
    prismaMock.matches.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.confirm('mentor-user-id', 'engagement-id'),
    ).rejects.toThrow('This chemistry proposal is no longer pending.');

    expect(prismaMock.matches.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'engagement-id',
          status: MatchStatus.CHEMISTRY_PENDING,
        },
      }),
    );
    expect(prismaMock.matches.update).not.toHaveBeenCalled();
    expect(prismaMock.matches.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(mailServiceMock.sendChemistryAcceptedEmail).not.toHaveBeenCalled();
  });

  it('sends only one acceptance email when two requests read the same pending proposal', async () => {
    const confirmedProposal = {
      ...pendingProposal,
      status: MatchStatus.CHEMISTRY_CONFIRMED,
      chemistryMentorConfirmedAt: new Date(),
    };

    prismaMock.matches.findFirst.mockResolvedValue(pendingProposal);
    prismaMock.matches.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    prismaMock.matches.findUniqueOrThrow.mockResolvedValue(confirmedProposal);

    const results = await Promise.allSettled([
      service.confirm('mentor-user-id', 'engagement-id'),
      service.confirm('mentor-user-id', 'engagement-id'),
    ]);

    expect(results[0]).toEqual({
      status: 'fulfilled',
      value: confirmedProposal,
    });
    expect(results[1].status).toBe('rejected');
    expect(results[1]).toHaveProperty('reason', expect.any(ConflictException));
    expect(prismaMock.matches.updateMany).toHaveBeenCalledTimes(2);
    expect(prismaMock.matches.update).not.toHaveBeenCalled();
    expect(mailServiceMock.sendChemistryAcceptedEmail).toHaveBeenCalledTimes(1);
  });

  it('rejects an already expired proposal without attempting acceptance', async () => {
    prismaMock.matches.findFirst.mockResolvedValue({
      ...pendingProposal,
      status: MatchStatus.DECLINED,
    });

    await expect(
      service.confirm('mentor-user-id', 'engagement-id'),
    ).rejects.toThrow('A declined engagement cannot be confirmed');

    expect(prismaMock.matches.updateMany).not.toHaveBeenCalled();
    expect(mailServiceMock.sendChemistryAcceptedEmail).not.toHaveBeenCalled();
  });

  it('is idempotent when mentor has already confirmed', async () => {
    const engagement = {
      id: 'engagement-id',
      status: MatchStatus.CHEMISTRY_CONFIRMED,
      menteeAcceptedAt: new Date(),
      chemistryBookedAt: new Date(),
      chemistryMentorConfirmedAt: new Date(),
      chemistryMenteeConfirmedAt: null,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);

    const result = await service.confirm('mentor-user-id', 'engagement-id');

    expect(result).toEqual(engagement);
    expect(prismaMock.matches.update).not.toHaveBeenCalled();
    expect(prismaMock.matches.updateMany).not.toHaveBeenCalled();
    expect(mailServiceMock.sendChemistryAcceptedEmail).not.toHaveBeenCalled();
  });

  it('rejects confirmation before mentee acceptance', async () => {
    prismaMock.matches.findFirst.mockResolvedValue({
      id: 'engagement-id',
      status: MatchStatus.CHEMISTRY_PENDING,
      menteeAcceptedAt: null,
      chemistryBookedAt: null,
      chemistryMentorConfirmedAt: null,
      chemistryMenteeConfirmedAt: null,
    });

    const action = service.confirm('mentor-user-id', 'engagement-id');

    await expect(action).rejects.toThrow(ConflictException);

    await expect(action).rejects.toThrow(
      'The mentee must accept the proposal before mentorship can be confirmed.',
    );

    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });

  describe('ending a mentorship', () => {
    const now = new Date('2026-11-18T12:00:00.000Z');
    const activeEngagement = {
      id: 'engagement-id',
      status: MatchStatus.ACTIVE,
      completedAt: null,
      mentorProfile: {
        user: { email: 'amina@example.com', fullName: 'Amina Patel' },
      },
      menteeProfile: {
        user: { email: 'casey@example.com', fullName: 'Casey Morgan' },
      },
    };
    const completedEngagement = {
      ...activeEngagement,
      status: MatchStatus.COMPLETED,
      completedAt: now,
    };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
      prismaMock.matches.findFirst.mockResolvedValue(activeEngagement);
      prismaMock.matches.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.matches.findUniqueOrThrow.mockResolvedValue(
        completedEngagement,
      );
    });

    it('completes an active mentorship before notifying both participants', async () => {
      prismaMock.matches.updateMany.mockImplementation(() => {
        expect(mailServiceMock.notifyMentorshipEnded).not.toHaveBeenCalled();
        return Promise.resolve({ count: 1 });
      });

      const result = await service.end('mentor-user-id', 'engagement-id');

      expect(prismaMock.matches.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'engagement-id',
            mentorProfile: { userId: 'mentor-user-id' },
          },
        }),
      );
      expect(prismaMock.matches.updateMany).toHaveBeenCalledWith({
        where: { id: 'engagement-id', status: MatchStatus.ACTIVE },
        data: { status: MatchStatus.COMPLETED, completedAt: now },
      });
      expect(prismaMock.matches.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'engagement-id' },
      });
      expect(mailServiceMock.notifyMentorshipEnded).toHaveBeenCalledTimes(1);
      expect(mailServiceMock.notifyMentorshipEnded).toHaveBeenCalledWith({
        mentor: { email: 'amina@example.com', fullName: 'Amina Patel' },
        mentee: { email: 'casey@example.com', fullName: 'Casey Morgan' },
      });
      expect(result).toEqual(completedEngagement);
    });

    it('returns the current match without notifying when no row was changed', async () => {
      prismaMock.matches.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.end('mentor-user-id', 'engagement-id');

      expect(result).toEqual(completedEngagement);
      expect(mailServiceMock.notifyMentorshipEnded).not.toHaveBeenCalled();
    });

    it('notifies only once when overlapping requests read the same active match', async () => {
      prismaMock.matches.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 0 });

      const results = await Promise.all([
        service.end('mentor-user-id', 'engagement-id'),
        service.end('mentor-user-id', 'engagement-id'),
      ]);

      expect(results).toEqual([completedEngagement, completedEngagement]);
      expect(prismaMock.matches.updateMany).toHaveBeenCalledTimes(2);
      expect(mailServiceMock.notifyMentorshipEnded).toHaveBeenCalledTimes(1);
    });

    it('does not update or notify when the mentorship is already completed', async () => {
      prismaMock.matches.findFirst.mockResolvedValue(completedEngagement);

      const result = await service.end('mentor-user-id', 'engagement-id');

      expect(result).toEqual(completedEngagement);
      expect(prismaMock.matches.updateMany).not.toHaveBeenCalled();
      expect(mailServiceMock.notifyMentorshipEnded).not.toHaveBeenCalled();
    });

    it.each([
      MatchStatus.CHEMISTRY_PENDING,
      MatchStatus.CHEMISTRY_CONFIRMED,
      MatchStatus.MATCH_PENDING,
      MatchStatus.DECLINED,
    ])('rejects ending a mentorship with status %s', async (status) => {
      prismaMock.matches.findFirst.mockResolvedValue({
        ...activeEngagement,
        status,
      });

      const action = service.end('mentor-user-id', 'engagement-id');

      await expect(action).rejects.toThrow(ConflictException);
      await expect(action).rejects.toThrow(
        status === MatchStatus.DECLINED
          ? 'A declined engagement cannot be ended.'
          : 'Only an active mentorship can be ended.',
      );

      expect(prismaMock.matches.updateMany).not.toHaveBeenCalled();
      expect(mailServiceMock.notifyMentorshipEnded).not.toHaveBeenCalled();
    });

    it('does not update or notify when the mentor does not own the match', async () => {
      prismaMock.matches.findFirst.mockResolvedValue(null);

      await expect(
        service.end('mentor-user-id', 'engagement-id'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.matches.updateMany).not.toHaveBeenCalled();
      expect(mailServiceMock.notifyMentorshipEnded).not.toHaveBeenCalled();
    });

    it('does not notify when the completion update fails', async () => {
      prismaMock.matches.updateMany.mockRejectedValue(
        new Error('Database unavailable'),
      );

      await expect(
        service.end('mentor-user-id', 'engagement-id'),
      ).rejects.toThrow('Database unavailable');

      expect(prismaMock.matches.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(mailServiceMock.notifyMentorshipEnded).not.toHaveBeenCalled();
    });
  });

  describe('mentorship started notifications', () => {
    const pendingCheckIn = {
      id: 'engagement-id',
      status: MatchStatus.MATCH_PENDING,
      checkInMenteeAgreed: true,
      checkInMentorAgreed: null,
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
      checkInMentorAgreed: true,
      checkInExpiresAt: null,
    };

    beforeEach(() => {
      prismaMock.matches.findFirst.mockResolvedValue(pendingCheckIn);
      prismaMock.matches.update.mockResolvedValue({
        ...pendingCheckIn,
        checkInMentorAgreed: true,
      });
      prismaMock.matches.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.matches.findUniqueOrThrow.mockResolvedValue(activeEngagement);
      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
          callback(prismaMock),
      );
    });

    it('notifies both participants only after the activation transaction succeeds', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
          const result = await callback(prismaMock);

          expect(
            mailServiceMock.notifyMentorshipStarted,
          ).not.toHaveBeenCalled();

          return result;
        },
      );

      const result = await service.respondToCheckIn(
        'mentor-user-id',
        'engagement-id',
        true,
      );

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
      expect(mailServiceMock.notifyMentorshipStarted).toHaveBeenCalledTimes(1);
      expect(mailServiceMock.notifyMentorshipStarted).toHaveBeenCalledWith({
        mentor: { email: 'amina@example.com', fullName: 'Amina Patel' },
        mentee: { email: 'casey@example.com', fullName: 'Casey Morgan' },
      });
      expect(result).toEqual(activeEngagement);
    });

    it.each([MatchStatus.MATCH_PENDING, MatchStatus.ACTIVE])(
      'does not notify when activation updates no rows and the returned match is %s',
      async (status) => {
        prismaMock.matches.updateMany.mockResolvedValue({ count: 0 });
        const updatedEngagement = {
          ...activeEngagement,
          status,
          checkInMenteeAgreed:
            status === MatchStatus.MATCH_PENDING ? null : true,
        };
        prismaMock.matches.findUniqueOrThrow.mockResolvedValue(
          updatedEngagement,
        );

        const result = await service.respondToCheckIn(
          'mentor-user-id',
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
        service.respondToCheckIn('mentor-user-id', 'engagement-id', true),
        service.respondToCheckIn('mentor-user-id', 'engagement-id', true),
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
        service.respondToCheckIn('mentor-user-id', 'engagement-id', true),
      ).rejects.toThrow('Transaction could not commit');

      expect(prismaMock.matches.updateMany).toHaveBeenCalledTimes(1);
      expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();
    });

    it('does not notify again when the mentor has already responded', async () => {
      const answeredEngagement = {
        ...pendingCheckIn,
        checkInMentorAgreed: true,
      };
      prismaMock.matches.findFirst.mockResolvedValue(answeredEngagement);

      const result = await service.respondToCheckIn(
        'mentor-user-id',
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
        service.respondToCheckIn('mentor-user-id', 'engagement-id', true),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();
    });
  });

  it('declines mentorship when mentor rejects the final check-in', async () => {
    const now = new Date('2026-09-01T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    const engagement = {
      id: 'engagement-id',
      menteeId: 'mentee-profile-id',
      status: MatchStatus.MATCH_PENDING,
      checkInMenteeAgreed: true,
      checkInMentorAgreed: null,
    };

    const declinedEngagement = {
      ...engagement,
      status: MatchStatus.DECLINED,
      checkInMentorAgreed: false,
      declinedAt: now,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        callback(prismaMock),
    );

    prismaMock.matches.update.mockResolvedValue(declinedEngagement);

    const result = await service.respondToCheckIn(
      'mentor-user-id',
      'engagement-id',
      false,
    );

    expect(prismaMock.matches.update).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
      },
      data: {
        checkInMentorAgreed: false,
        status: MatchStatus.DECLINED,
        declinedAt: now,
        checkInExpiresAt: null,
      },
    });

    expect(result).toEqual(declinedEngagement);
    expect(mailServiceMock.notifyMentorshipStarted).not.toHaveBeenCalled();
  });
});
