import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ApprovalStatus,
  AvailabilityOption,
  MatchStatus,
  MeetingCadence,
  MeetingStructure,
  Region,
} from '../../../generated/prisma/enums';
import type {
  MenteeWithRelations,
  MentorWithRelations,
} from '../../engine/scoring.engine';
import {
  DEFAULT_WEIGHTS,
  MatchingAlgoService,
  normalizeActiveRules,
} from './matching-algo.service';
import { MatchingDataService } from './matching-data.service';

type TestMentor = MentorWithRelations & {
  id: string;
  userId: string;
  currentJobTitle: string | null;
  capacity: number;
  region: Region | null;
  openToRemote: boolean;
  bio: string | null;
  isAcceptingMentees: boolean;
  approvalStatus: ApprovalStatus;
  notifiedAdminAt: Date | null;
  user: {
    fullName: string;
    email: string | null;
    linkedinURL: string | null;
    scheduleURL: string | null;
  };
  matches: { status: MatchStatus }[];
};

const richMentee = {
  id: 'mentee-1',
  userId: 'user-mentee-1',
  currentJobTitle: 'Junior Developer',
  bio: 'Looking for guidance',
  reasonsNote: null,
  region: Region.LONDON,
  openToRemote: true,
  availability: [AvailabilityOption.WEEKDAY_EVENING],
  meetingCadence: MeetingCadence.FORTNIGHTLY,
  meetingStructure: MeetingStructure.OPEN,
  goalDisciplines: [
    {
      menteeId: 'mentee-1',
      disciplineId: 'disc-1',
      discipline: { id: 'disc-1', name: 'Software Engineering' },
    },
  ],
  wantedSkills: [
    {
      menteeId: 'mentee-1',
      skillId: 'skill-1',
      skill: { id: 'skill-1', name: 'TypeScript' },
    },
  ],
  targetedIndustries: [
    {
      menteeId: 'mentee-1',
      industryId: 'ind-1',
      industry: { id: 'ind-1', name: 'Technology' },
    },
  ],
  matches: [] as { mentorId: string; status: MatchStatus }[],
} as unknown as MenteeWithRelations & {
  matches: { mentorId: string; status: MatchStatus }[];
};

function makeMentor(
  overrides: Partial<TestMentor> & { id: string },
): TestMentor {
  const id = overrides.id;
  const base = {
    id,
    userId: `user-${id}`,
    currentJobTitle: 'Senior Engineer',
    capacity: 3,
    region: Region.LONDON,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKDAY_EVENING],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.OPEN,
    bio: 'Mentor bio',
    isAcceptingMentees: true,
    approvalStatus: ApprovalStatus.ACCEPTED,
    notifiedAdminAt: null,
    user: {
      fullName: `Mentor ${id}`,
      email: `${id}@test.com`,
      linkedinURL: null,
      scheduleURL: null,
    },
    mentorDisciplines: [
      {
        mentorId: id,
        disciplineId: 'disc-1',
        discipline: { id: 'disc-1', name: 'Software Engineering' },
      },
    ],
    mentorSkills: [
      {
        mentorId: id,
        skillId: 'skill-1',
        skill: { id: 'skill-1', name: 'TypeScript' },
      },
    ],
    mentorDomainIndustries: [
      {
        mentorId: id,
        industryId: 'ind-1',
        industry: { id: 'ind-1', name: 'Technology' },
      },
    ],
    matches: [],
  } as unknown as TestMentor;

  return { ...base, ...overrides };
}

const standardConfig = {
  id: 'config-1',
  isActive: true,
  minScoreThreshold: 60,
  weights: DEFAULT_WEIGHTS.map((rule) => ({ ...rule })),
  createdAt: new Date(),
  updatedBy: 'admin-1',
};

describe('normalizeActiveRules', () => {
  it('accepts the JSON array shape used by MatchingConfig', () => {
    expect(normalizeActiveRules(standardConfig.weights)).toEqual(
      standardConfig.weights,
    );
  });

  it('accepts a legacy object-map shape', () => {
    expect(normalizeActiveRules({ disciplines: 70, skills: 30 })).toEqual([
      { categoryKey: 'disciplines', weight: 70 },
      { categoryKey: 'skills', weight: 30 },
    ]);
  });

  it('drops unknown/invalid rules and falls back if nothing usable remains', () => {
    expect(
      normalizeActiveRules([
        { categoryKey: 'unknown', weight: 50 },
        { categoryKey: 'skills', weight: -1 },
      ]),
    ).toEqual(DEFAULT_WEIGHTS);
  });

  it('uses the last duplicate definition for a category', () => {
    expect(
      normalizeActiveRules([
        { categoryKey: 'skills', weight: 10 },
        { categoryKey: 'skills', weight: 30 },
      ]),
    ).toEqual([{ categoryKey: 'skills', weight: 30 }]);
  });
});

describe('MatchingAlgoService', () => {
  let service: MatchingAlgoService;

  const mockMatchingDataService = {
    fetchMenteeContext: jest.fn(),
    fetchActiveConfig: jest.fn(),
    fetchEligibleCandidates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingAlgoService,
        { provide: MatchingDataService, useValue: mockMatchingDataService },
      ],
    }).compile();

    service = module.get(MatchingAlgoService);
    mockMatchingDataService.fetchMenteeContext.mockResolvedValue(richMentee);
    mockMatchingDataService.fetchActiveConfig.mockResolvedValue(standardConfig);
    mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([]);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findBestMatches', () => {
    it('calculates, filters and ranks multiple mentors above threshold', async () => {
      const topMentor = makeMentor({ id: 'mentor-top' }); // 100
      const secondMentor = makeMentor({
        id: 'mentor-second',
        region: Region.OTHER,
        // remote still matches = 10
        mentorSkills: [
          {
            mentorId: 'mentor-second',
            skillId: 'skill-x',
            skill: { id: 'skill-x', name: 'JavaScript' },
          },
        ], // skills = 0; everything else matches => 75
      });

      mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
        secondMentor,
        topMentor,
      ]);

      const results = await service.findBestMatches('mentee-1');

      expect(results).toHaveLength(2);
      expect(results[0].mentorId).toBe('mentor-top');
      expect(results[0].score).toBe(100);
      expect(results[1].mentorId).toBe('mentor-second');
      expect(results[1].score).toBe(75);
    });

    it('includes a mentor whose score is exactly the threshold', async () => {
      // discipline 25 + availability 20 + location 10 + meetingStyle 5 = 60
      const thresholdMentor = makeMentor({
        id: 'mentor-threshold',
        mentorSkills: [
          {
            mentorId: 'mentor-threshold',
            skillId: 'skill-x',
            skill: { id: 'skill-x', name: 'Other' },
          },
        ],
        mentorDomainIndustries: [
          {
            mentorId: 'mentor-threshold',
            industryId: 'ind-x',
            industry: { id: 'ind-x', name: 'Other' },
          },
        ],
        meetingCadence: MeetingCadence.MONTHLY,
      });

      mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
        thresholdMentor,
      ]);

      const results = await service.findBestMatches('mentee-1');
      expect(results).toHaveLength(1);
      expect(results[0].score).toBe(60);
    });

    it('drops a mentor below threshold', async () => {
      const lowMentor = makeMentor({
        id: 'mentor-low',
        region: Region.OTHER,
        openToRemote: false,
        availability: [AvailabilityOption.WEEKEND_MORNING],
        meetingCadence: MeetingCadence.MONTHLY,
        meetingStructure: MeetingStructure.STRUCTURED,
        mentorSkills: [
          {
            mentorId: 'mentor-low',
            skillId: 'skill-x',
            skill: { id: 'skill-x', name: 'Other' },
          },
        ],
        mentorDomainIndustries: [
          {
            mentorId: 'mentor-low',
            industryId: 'ind-x',
            industry: { id: 'ind-x', name: 'Other' },
          },
        ],
      });

      mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
        lowMentor,
      ]);
      await expect(service.findBestMatches('mentee-1')).resolves.toEqual([]);
    });

    it('keeps a mentor who still has spare capacity', async () => {
      const mentor = makeMentor({
        id: 'mentor-space',
        capacity: 2,
        matches: [{ status: MatchStatus.ACTIVE }],
      });
      mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
        mentor,
      ]);

      const results = await service.findBestMatches('mentee-1');
      expect(results).toHaveLength(1);
    });

    it.each([
      [2, 2],
      [2, 3],
      [0, 0],
    ])(
      'filters a mentor at/over capacity (capacity=%i, matches=%i)',
      async (capacity, matchCount) => {
        const mentor = makeMentor({
          id: `mentor-capacity-${capacity}-${matchCount}`,
          capacity,
          matches: Array.from({ length: matchCount }, () => ({
            status: MatchStatus.ACTIVE,
          })),
        });
        mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
          mentor,
        ]);

        await expect(service.findBestMatches('mentee-1')).resolves.toEqual([]);
      },
    );

    it('passes all previous mentor IDs to candidate exclusion without duplicates', async () => {
      mockMatchingDataService.fetchMenteeContext.mockResolvedValue({
        ...richMentee,
        matches: [
          { mentorId: 'mentor-a', status: MatchStatus.DECLINED },
          { mentorId: 'mentor-b', status: MatchStatus.ACTIVE },
          { mentorId: 'mentor-a', status: MatchStatus.DECLINED },
        ],
      });

      await service.findBestMatches('mentee-1');
      expect(
        mockMatchingDataService.fetchEligibleCandidates,
      ).toHaveBeenCalledWith(['mentor-a', 'mentor-b']);
    });

    it('actually scores candidates using default config when no config exists', async () => {
      mockMatchingDataService.fetchActiveConfig.mockResolvedValue(null);
      mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
        makeMentor({ id: 'mentor-default' }),
      ]);

      const results = await service.findBestMatches('mentee-1');
      expect(results).toHaveLength(1);
      expect(results[0].score).toBe(100);
    });

    it('falls back safely when config weights are malformed', async () => {
      mockMatchingDataService.fetchActiveConfig.mockResolvedValue({
        ...standardConfig,
        weights: [{ categoryKey: 'not-a-category', weight: 'bad' }],
      });
      mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
        makeMentor({ id: 'mentor-safe-fallback' }),
      ]);

      const results = await service.findBestMatches('mentee-1');
      expect(results[0].score).toBe(100);
    });

    it('uses a safe default threshold when configured threshold is invalid', async () => {
      mockMatchingDataService.fetchActiveConfig.mockResolvedValue({
        ...standardConfig,
        minScoreThreshold: 999,
      });
      mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
        makeMentor({ id: 'mentor-valid' }),
      ]);

      await expect(service.findBestMatches('mentee-1')).resolves.toHaveLength(
        1,
      );
    });

    it('sorts equal scores deterministically by mentor ID', async () => {
      mockMatchingDataService.fetchEligibleCandidates.mockResolvedValue([
        makeMentor({ id: 'mentor-z' }),
        makeMentor({ id: 'mentor-a' }),
      ]);

      const results = await service.findBestMatches('mentee-1');
      expect(results.map(({ mentorId }) => mentorId)).toEqual([
        'mentor-a',
        'mentor-z',
      ]);
    });

    it('propagates NotFoundException', async () => {
      mockMatchingDataService.fetchMenteeContext.mockRejectedValue(
        new NotFoundException('Mentee not found'),
      );
      await expect(service.findBestMatches('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('wraps unexpected failures', async () => {
      mockMatchingDataService.fetchMenteeContext.mockRejectedValue(
        new Error('database unavailable'),
      );
      await expect(service.findBestMatches('mentee-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
