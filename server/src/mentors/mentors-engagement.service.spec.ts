import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { MentorEngagementService } from './mentors-engagement.service';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';

describe('MentorEngagementService', () => {
  let service: MentorEngagementService;

  const prismaMock = {
    matches: {
      findFirst: jest.fn(),
      update: jest.fn(),
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
      ],
    }).compile();

    service = module.get<MentorEngagementService>(MentorEngagementService);

    jest.clearAllMocks();
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
    };

    const confirmedEngagement = {
      ...engagement,
      status: MatchStatus.CHEMISTRY_CONFIRMED,
      chemistryMentorConfirmedAt: now,
      scheduledCheckIn,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);
    prismaMock.matches.update.mockResolvedValue(confirmedEngagement);

    const result = await service.confirm('mentor-user-id', 'engagement-id');

    expect(prismaMock.matches.update).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
      },
      data: {
        status: MatchStatus.CHEMISTRY_CONFIRMED,
        chemistryMentorConfirmedAt: now,
        scheduledCheckIn,
        proposalExpiresAt: null,
      },
    });

    expect(result).toEqual(confirmedEngagement);
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

  it('ends an active mentorship', async () => {
    const now = new Date('2026-08-13T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    const engagement = {
      id: 'engagement-id',
      status: MatchStatus.ACTIVE,
      completedAt: null,
    };

    const completedEngagement = {
      ...engagement,
      status: MatchStatus.COMPLETED,
      completedAt: now,
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);
    prismaMock.matches.update.mockResolvedValue(completedEngagement);

    const result = await service.end('mentor-user-id', 'engagement-id');

    expect(prismaMock.matches.update).toHaveBeenCalledWith({
      where: {
        id: 'engagement-id',
      },
      data: {
        status: MatchStatus.COMPLETED,
        completedAt: now,
      },
    });

    expect(result).toEqual(completedEngagement);
  });

  it('is idempotent when mentorship is already completed', async () => {
    const engagement = {
      id: 'engagement-id',
      status: MatchStatus.COMPLETED,
      completedAt: new Date(),
    };

    prismaMock.matches.findFirst.mockResolvedValue(engagement);

    const result = await service.end('mentor-user-id', 'engagement-id');

    expect(result).toEqual(engagement);
    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });

  it('rejects ending a declined engagement', async () => {
    prismaMock.matches.findFirst.mockResolvedValue({
      id: 'engagement-id',
      status: MatchStatus.DECLINED,
    });

    const action = service.end('mentor-user-id', 'engagement-id');

    await expect(action).rejects.toThrow(ConflictException);
    await expect(action).rejects.toThrow(
      'A declined engagement cannot be ended.',
    );

    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });

  it('rejects ending a pre-active engagement', async () => {
    prismaMock.matches.findFirst.mockResolvedValue({
      id: 'engagement-id',
      status: MatchStatus.CHEMISTRY_PENDING,
    });

    const action = service.end('mentor-user-id', 'engagement-id');

    await expect(action).rejects.toThrow(ConflictException);
    await expect(action).rejects.toThrow(
      'Only an active mentorship can be ended.',
    );

    expect(prismaMock.matches.update).not.toHaveBeenCalled();
  });
});
