import { Test, TestingModule } from '@nestjs/testing';

import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ApprovalStatus } from '../generated/prisma/enums';

describe('AdminService', () => {
  let service: AdminService;

  const prismaMock = {
    mentorProfile: {
      count: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    menteeProfile: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    matches: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    menteeWaitingList: {
      findMany: jest.fn(),
    },
  };

  const mailServiceMock = {
    sendMentorApprovalDecisionEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mailServiceMock.sendMentorApprovalDecisionEmail
      .mockReset()
      .mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
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

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverview', () => {
    it('returns programme KPIs, waiting mentees and matched pairs', async () => {
      prismaMock.mentorProfile.count.mockResolvedValue(4);

      prismaMock.matches.count.mockResolvedValue(3);

      prismaMock.menteeWaitingList.findMany.mockResolvedValue([
        {
          createdAt: new Date('2026-08-20T10:00:00.000Z'),
          menteeProfile: {
            id: 'mentee-1',
            user: {
              fullName: 'Test Mentee',
              email: 'mentee@example.com',
            },
            goalDisciplines: [
              {
                discipline: {
                  name: 'Software Engineering',
                },
              },
              {
                discipline: {
                  name: 'DevOps',
                },
              },
            ],
          },
        },
      ]);

      prismaMock.mentorProfile.findMany.mockResolvedValue([
        {
          capacity: 3,
          matches: [{ id: 'match-1' }, { id: 'match-2' }],
        },
        {
          capacity: 2,
          matches: [],
        },
      ]);

      prismaMock.matches.findMany.mockResolvedValue([
        {
          id: 'match-1',
          status: 'ACTIVE',
          menteeProfile: {
            id: 'mentee-2',
            user: {
              fullName: 'Matched Mentee',
              email: 'matched.mentee@example.com',
            },
          },
          mentorProfile: {
            id: 'mentor-1',
            user: {
              fullName: 'Matched Mentor',
              email: 'matched.mentor@example.com',
            },
          },
        },
      ]);

      const result = await service.getOverview();

      expect(result).toEqual({
        volunteerMentors: 4,
        openMenteePlaces: 3,
        liveMatches: 3,
        pendingMentors: 4,
        menteesWaiting: 1,

        waitingMentees: [
          {
            id: 'mentee-1',
            fullName: 'Test Mentee',
            email: 'mentee@example.com',
            goals: ['Software Engineering', 'DevOps'],
            waitingSince: new Date('2026-08-20T10:00:00.000Z'),
          },
        ],

        matchedPairs: [
          {
            matchId: 'match-1',
            mentee: {
              id: 'mentee-2',
              fullName: 'Matched Mentee',
              email: 'matched.mentee@example.com',
            },
            mentor: {
              id: 'mentor-1',
              fullName: 'Matched Mentor',
              email: 'matched.mentor@example.com',
            },
            status: 'ACTIVE',
          },
        ],
      });
    });

    it('returns zero counts and empty arrays when there is no programme data', async () => {
      prismaMock.mentorProfile.count.mockResolvedValue(0);

      prismaMock.matches.count.mockResolvedValue(0);

      prismaMock.menteeWaitingList.findMany.mockResolvedValue([]);

      prismaMock.mentorProfile.findMany.mockResolvedValue([]);

      prismaMock.matches.findMany.mockResolvedValue([]);

      const result = await service.getOverview();

      expect(result).toEqual({
        volunteerMentors: 0,
        openMenteePlaces: 0,
        liveMatches: 0,
        menteesWaiting: 0,
        pendingMentors: 0,
        waitingMentees: [],
        matchedPairs: [],
      });
    });
  });

  describe('getMentors', () => {
    it('returns paginated mentors with derived load and matched mentees', async () => {
      prismaMock.mentorProfile.findMany.mockResolvedValue([
        {
          id: 'mentor-profile-1',
          user: {
            id: 'user-1',
            fullName: 'Alex Mentor',
            role: 'MENTOR',
            email: 'alex@example.com',
            createdAt: new Date('2026-08-20T10:00:00.000Z'),
            linkedinURL: 'https://linkedin.com/in/alex',
          },
          matches: [
            {
              id: 'match-1',
              status: 'ACTIVE',
              scores: 88,
              createdAt: new Date('2026-08-20T11:00:00.000Z'),
              declinedAt: null,
              menteeProfile: {
                id: 'mentee-profile-1',
                user: {
                  fullName: 'Sam Mentee',
                  email: 'sam@example.com',
                },
              },
            },
          ],
          bio: 'Senior frontend engineer',
          capacity: 3,
          region: 'LONDON',
          availability: ['WEEKDAY_EVENING'],
          mentorDisciplines: [
            {
              discipline: {
                name: 'Software Engineering',
              },
            },
          ],
        },
      ]);

      prismaMock.mentorProfile.count.mockResolvedValue(1);

      const result = await service.getMentors({
        search: 'alex',
        page: 1,
        limit: 20,
      });

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);

      expect(result.mentors).toHaveLength(1);

      expect(result.mentors[0]).toMatchObject({
        mentorProfileId: 'mentor-profile-1',
        fullName: 'Alex Mentor',
        email: 'alex@example.com',
        disciplines: ['Software Engineering'],

        capacity: {
          filled: 1,
          total: 3,
          isFull: false,
        },

        matchedMentees: [
          {
            menteeProfileId: 'mentee-profile-1',
            fullName: 'Sam Mentee',
            email: 'sam@example.com',
          },
        ],
      });
    });

    it('passes search and pagination to Prisma', async () => {
      prismaMock.mentorProfile.findMany.mockResolvedValue([]);
      prismaMock.mentorProfile.count.mockResolvedValue(0);

      const result = await service.getMentors({
        search: 'devops',
        page: 2,
        limit: 10,
      });

      const expectedWhere = {
        OR: [
          {
            user: {
              fullName: {
                contains: 'devops',
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              email: {
                contains: 'devops',
                mode: 'insensitive',
              },
            },
          },
          {
            mentorDisciplines: {
              some: {
                discipline: {
                  name: {
                    contains: 'devops',
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      };

      expect(prismaMock.mentorProfile.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      expect(result).toEqual({
        mentors: [],
        total: 0,
        page: 2,
        limit: 10,
      });
    });

    it('returns total 0 and an empty mentor list when nothing matches', async () => {
      prismaMock.mentorProfile.findMany.mockResolvedValue([]);
      prismaMock.mentorProfile.count.mockResolvedValue(0);

      const result = await service.getMentors({
        search: 'does-not-exist',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        mentors: [],
        total: 0,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('getMentees', () => {
    it('returns paginated mentees with goals, current mentor and status', async () => {
      prismaMock.menteeProfile.findMany.mockResolvedValue([
        {
          id: 'mentee-profile-1',
          user: {
            fullName: 'Sam Mentee',
            role: 'MENTEE',
            email: 'sam@example.com',
            createdAt: new Date('2026-08-20T10:00:00.000Z'),
            linkedinURL: 'https://linkedin.com/in/sam',
          },
          matches: [
            {
              id: 'match-1',
              status: 'ACTIVE',
              scores: 91,
              createdAt: new Date('2026-08-20T11:00:00.000Z'),
              declinedAt: null,
              mentorProfile: {
                id: 'mentor-profile-1',
                user: {
                  fullName: 'Alex Mentor',
                  email: 'alex@example.com',
                },
              },
            },
          ],
          region: 'LONDON',
          availability: ['WEEKDAY_EVENING'],
          goalDisciplines: [
            {
              discipline: {
                name: 'Software Engineering',
              },
            },
            {
              discipline: {
                name: 'DevOps',
              },
            },
          ],
        },
      ]);

      prismaMock.menteeProfile.count.mockResolvedValue(1);

      const result = await service.getMentees({
        search: 'sam',
        page: 1,
        limit: 20,
      });

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);

      expect(result.mentees).toHaveLength(1);

      expect(result.mentees[0]).toMatchObject({
        menteeProfileId: 'mentee-profile-1',
        fullName: 'Sam Mentee',
        email: 'sam@example.com',
        goals: ['Software Engineering', 'DevOps'],

        mentor: {
          mentorProfileId: 'mentor-profile-1',
          fullName: 'Alex Mentor',
          email: 'alex@example.com',
        },

        status: 'ACTIVE',
      });
    });

    it('passes search to Prisma and returns pagination metadata', async () => {
      prismaMock.menteeProfile.findMany.mockResolvedValue([]);
      prismaMock.menteeProfile.count.mockResolvedValue(0);

      const result = await service.getMentees({
        search: 'software',
        page: 2,
        limit: 10,
      });

      const expectedWhere = {
        OR: [
          {
            user: {
              fullName: {
                contains: 'software',
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              email: {
                contains: 'software',
                mode: 'insensitive',
              },
            },
          },
          {
            goalDisciplines: {
              some: {
                discipline: {
                  name: {
                    contains: 'software',
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      };

      expect(prismaMock.menteeProfile.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });

      expect(result).toEqual({
        mentees: [],
        total: 0,
        page: 2,
        limit: 10,
      });
    });

    it('returns total 0 and an empty mentee list when nothing matches', async () => {
      prismaMock.menteeProfile.findMany.mockResolvedValue([]);
      prismaMock.menteeProfile.count.mockResolvedValue(0);

      const result = await service.getMentees({
        search: 'does-not-exist',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        mentees: [],
        total: 0,
        page: 1,
        limit: 20,
      });
    });

    it('returns null mentor and status when a mentee has no live match', async () => {
      prismaMock.menteeProfile.findMany.mockResolvedValue([
        {
          id: 'mentee-profile-2',
          user: {
            fullName: 'Unmatched Mentee',
            role: 'MENTEE',
            email: 'unmatched@example.com',
            createdAt: new Date('2026-08-20T10:00:00.000Z'),
            linkedinURL: null,
          },
          matches: [],
          region: 'WEST_MIDLANDS',
          availability: ['WEEKEND_MORNING'],
          goalDisciplines: [
            {
              discipline: {
                name: 'Cybersecurity',
              },
            },
          ],
        },
      ]);

      prismaMock.menteeProfile.count.mockResolvedValue(1);

      const result = await service.getMentees({
        page: 1,
        limit: 20,
      });

      expect(result.mentees[0]).toMatchObject({
        menteeProfileId: 'mentee-profile-2',
        fullName: 'Unmatched Mentee',
        goals: ['Cybersecurity'],
        mentor: null,
        status: null,
      });
    });
  });

  describe('updateMentorApproval', () => {
    const mentor = {
      id: 'mentor-profile-1',
      approvalStatus: ApprovalStatus.ACCEPTED,
      currentJobTitle: 'Senior Engineer',
      user: {
        fullName: 'Alex Mentor',
        email: 'alex@example.com',
      },
    };

    it('sends the decision email and stores its timestamp when the decision changes', async () => {
      const decisionTime = new Date('2026-08-28T18:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(decisionTime);

      prismaMock.mentorProfile.findUnique.mockResolvedValue({
        approvalStatus: ApprovalStatus.PENDING,
      });
      prismaMock.mentorProfile.update.mockResolvedValue(mentor);

      const result = await service.updateMentorApproval(
        mentor.id,
        ApprovalStatus.ACCEPTED,
      );

      expect(prismaMock.mentorProfile.update).toHaveBeenNthCalledWith(1, {
        where: {
          id: mentor.id,
        },
        data: {
          approvalStatus: ApprovalStatus.ACCEPTED,
          approvalDecisionEmailSentAt: null,
        },
        select: {
          id: true,
          approvalStatus: true,
          currentJobTitle: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });
      expect(
        mailServiceMock.sendMentorApprovalDecisionEmail,
      ).toHaveBeenCalledWith({
        email: 'alex@example.com',
        fullName: 'Alex Mentor',
        approvalStatus: ApprovalStatus.ACCEPTED,
      });
      expect(prismaMock.mentorProfile.update).toHaveBeenNthCalledWith(2, {
        where: {
          id: mentor.id,
        },
        data: {
          approvalDecisionEmailSentAt: decisionTime,
        },
      });
      expect(result).toEqual(mentor);
    });

    it('does not resend the email when the approval status is unchanged', async () => {
      prismaMock.mentorProfile.findUnique.mockResolvedValue({
        approvalStatus: ApprovalStatus.ACCEPTED,
      });
      prismaMock.mentorProfile.update.mockResolvedValue(mentor);

      const result = await service.updateMentorApproval(
        mentor.id,
        ApprovalStatus.ACCEPTED,
      );

      expect(prismaMock.mentorProfile.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.mentorProfile.update).toHaveBeenCalledWith({
        where: {
          id: mentor.id,
        },
        data: {
          approvalStatus: ApprovalStatus.ACCEPTED,
        },
        select: {
          id: true,
          approvalStatus: true,
          currentJobTitle: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });
      expect(
        mailServiceMock.sendMentorApprovalDecisionEmail,
      ).not.toHaveBeenCalled();
      expect(result).toEqual(mentor);
    });

    it('returns the updated mentor without a timestamp when email delivery fails', async () => {
      prismaMock.mentorProfile.findUnique.mockResolvedValue({
        approvalStatus: ApprovalStatus.PENDING,
      });
      prismaMock.mentorProfile.update.mockResolvedValue(mentor);
      mailServiceMock.sendMentorApprovalDecisionEmail.mockRejectedValue(
        new Error('SES unavailable'),
      );

      const result = await service.updateMentorApproval(
        mentor.id,
        ApprovalStatus.ACCEPTED,
      );

      expect(
        mailServiceMock.sendMentorApprovalDecisionEmail,
      ).toHaveBeenCalledTimes(1);
      expect(prismaMock.mentorProfile.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mentor);
    });
  });
});
