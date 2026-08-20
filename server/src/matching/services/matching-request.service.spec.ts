import { Test, TestingModule } from '@nestjs/testing';

import { MatchingRequestService } from './matching-request.service';
import { MatchingAlgoService } from './matching-algo.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchStatus, Region } from '../../generated/prisma/enums';
import type { Prisma } from '../../generated/prisma/client';

describe('MatchingRequestService', () => {
  let service: MatchingRequestService;

  const prismaMock = {
    menteeProfile: {
      findUnique: jest.fn(),
    },
    matches: {
      findFirst: jest.fn(),
      create: jest.fn<Promise<unknown>, [Prisma.MatchesCreateArgs]>(),
    },
    mentorProfile: {
      findUnique: jest.fn(),
    },
    menteeWaitingList: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const matchingAlgoServiceMock = {
    findBestMatches: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingRequestService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: MatchingAlgoService,
          useValue: matchingAlgoServiceMock,
        },
      ],
    }).compile();

    service = module.get<MatchingRequestService>(MatchingRequestService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the best recommendation without creating a match', async () => {
    prismaMock.menteeProfile.findUnique.mockResolvedValue({
      id: 'mentee-profile-id',
      userId: 'mentee-user-id',
      region: Region.LONDON,
      openToRemote: true,
      availability: [],
      meetingCadence: null,
      meetingStructure: null,
      goalDisciplines: [],
      wantedSkills: [],
      targetedIndustries: [],
    });

    prismaMock.matches.findFirst.mockResolvedValue(null);

    const recommendation = {
      mentorId: 'mentor-profile-id',
      userId: 'mentor-user-id',
      score: 92,
      categoryScores: {
        disciplines: 1,
        skills: 1,
        availability: 1,
        location: 1,
        industries: 1,
        meetingStructure: 1,
        meetingCadence: 1,
      },
      profile: {
        fullName: 'Amina Patel',
        currentJobTitle: 'Senior Software Engineer',
        region: Region.LONDON,
        openToRemote: true,
        bio: 'Experienced mentor',
        linkedinURL: 'https://linkedin.com/in/amina',
      },
    };

    matchingAlgoServiceMock.findBestMatches.mockResolvedValue([recommendation]);

    const result = await service.requestMatch('mentee-user-id');

    expect(result).toEqual({
      status: 'RECOMMENDED',
      recommendation,
    });

    expect(prismaMock.matches.create).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('creates a chemistry-pending match when the mentee proposes chemistry', async () => {
    const now = new Date('2026-08-20T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    const proposalExpiresAt = new Date('2026-08-27T12:00:00.000Z');

    const mentee = {
      id: 'mentee-profile-id',
      userId: 'mentee-user-id',
      region: Region.LONDON,
      openToRemote: true,
      availability: [],
      meetingCadence: null,
      meetingStructure: null,
      goalDisciplines: [],
      wantedSkills: [],
      targetedIndustries: [],
    };

    const mentor = {
      id: 'mentor-profile-id',
      userId: 'mentor-user-id',
      currentJobTitle: 'Senior Software Engineer',
      region: Region.LONDON,
      openToRemote: true,
      availability: [],
      meetingCadence: null,
      meetingStructure: null,
      capacity: 2,
      mentorDisciplines: [],
      mentorSkills: [],
      mentorDomainIndustries: [],
      matches: [],
      user: {
        fullName: 'Amina Patel',
      },
    };

    prismaMock.menteeProfile.findUnique.mockResolvedValue(mentee);
    prismaMock.matches.findFirst.mockResolvedValue(null);

    matchingAlgoServiceMock.findBestMatches.mockResolvedValue([
      {
        mentorId: mentor.id,
        userId: mentor.userId,
        score: 92,
        categoryScores: {
          disciplines: 1,
          skills: 1,
          availability: 1,
          location: 1,
          industries: 1,
          meetingStructure: 1,
          meetingCadence: 1,
        },
        profile: {
          fullName: 'Amina Patel',
          currentJobTitle: mentor.currentJobTitle,
          region: mentor.region,
          openToRemote: true,
          bio: 'Experienced mentor',
          linkedinURL: 'https://linkedin.com/in/amina',
        },
      },
    ]);

    prismaMock.mentorProfile.findUnique.mockResolvedValue(mentor);

    const createdMatch = {
      id: 'match-id',
      menteeId: mentee.id,
      mentorId: mentor.id,
      status: MatchStatus.CHEMISTRY_PENDING,
    };

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
        prismaMock.matches.create.mockResolvedValue(createdMatch);

        return callback(prismaMock);
      },
    );

    const result = await service.proposeChemistry(
      'mentee-user-id',
      'mentor-profile-id',
    );

    expect(prismaMock.matches.create).toHaveBeenCalledTimes(1);

    const createArgs = prismaMock.matches.create.mock.calls[0]?.[0];

    expect(createArgs?.data.menteeId).toBe('mentee-profile-id');
    expect(createArgs?.data.mentorId).toBe('mentor-profile-id');
    expect(createArgs?.data.status).toBe(MatchStatus.CHEMISTRY_PENDING);
    expect(createArgs?.data.menteeAcceptedAt).toEqual(now);
    expect(createArgs?.data.chemistryMenteeConfirmedAt).toEqual(now);
    expect(createArgs?.data.proposalExpiresAt).toEqual(proposalExpiresAt);

    expect(result).toEqual({
      status: 'CHEMISTRY_PENDING',
      matchId: 'match-id',
    });
  });
});
