import { Test, TestingModule } from '@nestjs/testing';

import { MentorDashboardService } from './mentors-dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';

describe('MentorDashboardService', () => {
  let service: MentorDashboardService;

  const prismaMock = {
    mentorProfile: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorDashboardService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MentorDashboardService>(MentorDashboardService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns an empty dashboard when the mentor has no engagements', async () => {
    prismaMock.mentorProfile.findUnique.mockResolvedValue({
      id: 'mentor-profile-id',
      userId: 'user-id',
      capacity: 3,
      isAcceptingMentees: true,
      bio: 'Backend engineer and mentor',
      user: {
        id: 'user-id',
        fullName: 'John Doe',
      },
      mentorDisciplines: [
        {
          discipline: {
            name: 'Software Engineering',
          },
        },
      ],
      matches: [],
    });

    const result = await service.getDashboard('user-id');

    expect(result).toEqual({
      fullName: 'John Doe',
      capacity: {
        filled: 0,
        total: 3,
        isAtCapacity: false,
      },
      isAcceptingMentees: true,
      engagements: [],
      profileSummary: {
        disciplines: ['Software Engineering'],
        bio: 'Backend engineer and mentor',
      },
    });
  });

  it('withholds mentee email while awaiting acceptance', async () => {
    prismaMock.mentorProfile.findUnique.mockResolvedValue({
      id: 'mentor-profile-id',
      userId: 'user-id',
      capacity: 3,
      isAcceptingMentees: true,
      bio: 'Backend engineer and mentor',
      user: {
        id: 'user-id',
        fullName: 'Jane Doe',
      },
      mentorDisciplines: [],
      matches: [
        {
          id: 'match-id',
          status: MatchStatus.CHEMISTRY_PENDING,

          menteeAcceptedAt: null,
          chemistryBookedAt: null,
          chemistryMentorConfirmedAt: null,
          chemistryMenteeConfirmedAt: null,

          proposalExpiresAt: new Date('2026-08-19T12:00:00Z'),
          checkInExpiresAt: null,

          createdAt: new Date(),

          menteeProfile: {
            id: 'mentee-profile-id',
            currentJobTitle: 'Junior Software Engineer',
            reasonsNote: null,

            user: {
              id: 'mentee-user-id',
              fullName: 'Jane Doe',
              email: 'jane@example.com',
            },

            goalDisciplines: [
              {
                discipline: {
                  name: 'Software Engineering',
                },
              },
            ],
          },
        },
      ],
    });

    const result = await service.getDashboard('user-id');

    expect(result.engagements[0].subStatus).toBe(
      'proposed-awaiting-acceptance',
    );

    expect(result.engagements[0].mentee.email).toBeNull();

    expect(result.capacity).toEqual({
      filled: 1,
      total: 3,
      isAtCapacity: false,
    });
  });

  it('reveals mentee email after the mentee accepts', async () => {
    prismaMock.mentorProfile.findUnique.mockResolvedValue({
      id: 'mentor-profile-id',
      userId: 'user-id',
      capacity: 1,
      isAcceptingMentees: true,
      bio: 'Backend engineer and mentor',
      user: {
        id: 'user-id',
        fullName: 'Jane Doe',
      },
      mentorDisciplines: [],
      matches: [
        {
          id: 'match-id',
          status: MatchStatus.CHEMISTRY_PENDING,

          menteeAcceptedAt: new Date(),
          chemistryBookedAt: null,
          chemistryMentorConfirmedAt: null,
          chemistryMenteeConfirmedAt: null,

          proposalExpiresAt: null,
          checkInExpiresAt: null,

          createdAt: new Date(),

          menteeProfile: {
            id: 'mentee-profile-id',
            currentJobTitle: 'Junior Software Engineer',
            reasonsNote: null,

            user: {
              id: 'mentee-user-id',
              fullName: 'Jane Doe',
              email: 'jane@example.com',
            },

            goalDisciplines: [],
          },
        },
      ],
    });

    const result = await service.getDashboard('user-id');

    expect(result.engagements[0].subStatus).toBe('awaiting-booking');

    expect(result.engagements[0].mentee.email).toBe('jane@example.com');

    expect(result.capacity.isAtCapacity).toBe(true);
  });
});
