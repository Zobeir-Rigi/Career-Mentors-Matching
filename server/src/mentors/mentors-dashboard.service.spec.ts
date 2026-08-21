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

  afterEach(() => {
    jest.useRealTimers();
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
        fullName: 'Amina Patel',
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
      fullName: 'Amina Patel',

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

  it('shows mentee profile context but hides email for a chemistry proposal', async () => {
    const now = new Date('2026-08-20T12:00:00.000Z');

    const proposalExpiresAt = new Date('2026-08-27T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(now);

    prismaMock.mentorProfile.findUnique.mockResolvedValue({
      id: 'mentor-profile-id',
      userId: 'mentor-user-id',
      capacity: 3,
      isAcceptingMentees: true,
      bio: 'Mentor bio',

      user: {
        id: 'mentor-user-id',
        fullName: 'Amina Patel',
      },

      mentorDisciplines: [],

      matches: [
        {
          id: 'match-id',
          status: MatchStatus.CHEMISTRY_PENDING,

          chemistryBookedAt: null,
          proposalExpiresAt,
          checkInExpiresAt: null,
          scheduledCheckIn: null,
          checkInMenteeAgreed: null,
          checkInMentorAgreed: null,

          menteeProfile: {
            id: 'mentee-profile-id',

            currentJobTitle: 'Junior Software Engineer',

            bio: 'I enjoy building products and learning from experienced engineers.',

            reasonsNote:
              'I want support moving into a stronger software engineering role.',

            user: {
              id: 'mentee-user-id',
              fullName: 'Sam Match',
              email: 'mentee.match@example.com',
              linkedinURL: 'https://linkedin.com/in/sam-match',
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

    const result = await service.getDashboard('mentor-user-id');

    const engagement = result.engagements[0];

    expect(engagement.subStatus).toBe('proposed-awaiting-acceptance');

    expect(engagement.mentee.email).toBeNull();

    expect(engagement.mentee.linkedinURL).toBe(
      'https://linkedin.com/in/sam-match',
    );

    expect(engagement.mentee.bio).toBe(
      'I enjoy building products and learning from experienced engineers.',
    );

    expect(engagement.mentee.reasonsNote).toBe(
      'I want support moving into a stronger software engineering role.',
    );

    expect(engagement.mentee.goals).toEqual(['Software Engineering']);

    expect(engagement.countdown.daysLeft).toBe(7);

    expect(result.capacity).toEqual({
      filled: 1,
      total: 3,
      isAtCapacity: false,
    });
  });

  it('reveals mentee email after chemistry acceptance', async () => {
    const scheduledCheckIn = new Date('2026-08-28T12:00:00.000Z');

    prismaMock.mentorProfile.findUnique.mockResolvedValue({
      id: 'mentor-profile-id',
      userId: 'mentor-user-id',
      capacity: 1,
      isAcceptingMentees: true,
      bio: 'Mentor bio',

      user: {
        id: 'mentor-user-id',
        fullName: 'Amina Patel',
      },

      mentorDisciplines: [],

      matches: [
        {
          id: 'match-id',

          status: MatchStatus.CHEMISTRY_CONFIRMED,

          chemistryBookedAt: null,
          proposalExpiresAt: null,
          checkInExpiresAt: null,
          scheduledCheckIn,
          checkInMenteeAgreed: null,
          checkInMentorAgreed: null,

          menteeProfile: {
            id: 'mentee-profile-id',
            currentJobTitle: 'Junior Software Engineer',
            bio: 'Mentee bio',
            reasonsNote: 'Career development',

            user: {
              id: 'mentee-user-id',
              fullName: 'Sam Match',
              email: 'mentee.match@example.com',
              linkedinURL: 'https://linkedin.com/in/sam-match',
            },

            goalDisciplines: [],
          },
        },
      ],
    });

    const result = await service.getDashboard('mentor-user-id');

    const engagement = result.engagements[0];

    expect(engagement.subStatus).toBe('awaiting-booking');

    expect(engagement.mentee.email).toBe('mentee.match@example.com');

    expect(engagement.scheduledCheckIn).toEqual(scheduledCheckIn);

    expect(result.capacity.isAtCapacity).toBe(true);
  });

  it('returns the final check-in state for a match-pending engagement', async () => {
    const checkInExpiresAt = new Date('2026-09-04T12:00:00.000Z');

    prismaMock.mentorProfile.findUnique.mockResolvedValue({
      id: 'mentor-profile-id',
      userId: 'mentor-user-id',
      capacity: 2,
      isAcceptingMentees: true,
      bio: 'Mentor bio',

      user: {
        id: 'mentor-user-id',
        fullName: 'Amina Patel',
      },

      mentorDisciplines: [],

      matches: [
        {
          id: 'match-id',

          status: MatchStatus.MATCH_PENDING,

          chemistryBookedAt: new Date(),

          proposalExpiresAt: null,
          checkInExpiresAt,
          scheduledCheckIn: new Date(),

          checkInMenteeAgreed: true,
          checkInMentorAgreed: null,

          menteeProfile: {
            id: 'mentee-profile-id',
            currentJobTitle: 'Junior Software Engineer',
            bio: 'Mentee bio',
            reasonsNote: 'Career development',

            user: {
              id: 'mentee-user-id',
              fullName: 'Sam Match',
              email: 'mentee.match@example.com',
              linkedinURL: 'https://linkedin.com/in/sam-match',
            },

            goalDisciplines: [],
          },
        },
      ],
    });

    const result = await service.getDashboard('mentor-user-id');

    const engagement = result.engagements[0];

    expect(engagement.subStatus).toBe('confirmed-waiting');

    expect(engagement.checkIn).toEqual({
      menteeAgreed: true,
      mentorAgreed: null,
    });

    expect(engagement.countdown.expiresAt).toEqual(checkInExpiresAt);
  });
});
