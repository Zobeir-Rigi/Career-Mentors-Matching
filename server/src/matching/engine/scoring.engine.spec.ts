import {
  calculateArrayOverlapScore,
  calculateDynamicScore,
  calculateLocationScore,
  calculateMeetingCadenceScore,
  calculateMeetingStructureScore,
  computeAllCategoryScores,
  type ActiveRule,
  type CategoryScores,
  type MenteeWithRelations,
  type MentorWithRelations,
} from './scoring.engine';
import {
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  Region,
} from '../../generated/prisma/enums';

describe('Scoring Engine', () => {
  describe('calculateArrayOverlapScore', () => {
    it.each([
      [['TypeScript', 'React'], ['TypeScript', 'React', 'Node'], 1],
      [['TypeScript', 'React', 'Python'], ['TypeScript', 'Node'], 1 / 3],
      [['Python', 'Django'], ['TypeScript', 'React'], 0],
      [[], ['TypeScript'], 1],
      [null, ['TypeScript'], 1],
      [undefined, ['TypeScript'], 1],
      [['React'], [], 0],
      [['React'], null, 0],
      [['React'], undefined, 0],
    ] as const)(
      'scores mentee=%p against mentor=%p correctly',
      (menteeItems, mentorItems, expected) => {
        expect(
          calculateArrayOverlapScore(menteeItems, mentorItems),
        ).toBeCloseTo(expected);
      },
    );

    it('does not let duplicate mentee values distort the score', () => {
      expect(
        calculateArrayOverlapScore(
          ['TypeScript', 'TypeScript', 'React'],
          ['TypeScript'],
        ),
      ).toBe(0.5);
    });

    it('is unaffected by extra mentor capabilities', () => {
      const base = calculateArrayOverlapScore(['TypeScript'], ['TypeScript']);
      const withExtras = calculateArrayOverlapScore(
        ['TypeScript'],
        ['TypeScript', 'React', 'Node', 'Python'],
      );
      expect(withExtras).toBe(base);
    });
  });

  describe('calculateLocationScore', () => {
    it('matches the same region regardless of remote settings', () => {
      expect(
        calculateLocationScore(Region.LONDON, Region.LONDON, false, false),
      ).toBe(1);
    });

    it('matches different regions when both are open to remote', () => {
      expect(
        calculateLocationScore(Region.LONDON, Region.CAPE_TOWN, true, true),
      ).toBe(1);
    });

    it.each([
      [true, false],
      [false, true],
      [false, false],
    ])(
      'rejects different regions when remote compatibility is %p/%p',
      (menteeRemote, mentorRemote) => {
        expect(
          calculateLocationScore(
            Region.LONDON,
            Region.CAPE_TOWN,
            menteeRemote,
            mentorRemote,
          ),
        ).toBe(0);
      },
    );

    it('allows remote compatibility even if region data is absent', () => {
      expect(calculateLocationScore(null, undefined, true, true)).toBe(1);
    });
  });

  describe('meeting preference scores', () => {
    it('scores meeting structure as binary compatibility', () => {
      expect(
        calculateMeetingStructureScore(
          MeetingStructure.OPEN,
          MeetingStructure.OPEN,
        ),
      ).toBe(1);
      expect(
        calculateMeetingStructureScore(
          MeetingStructure.OPEN,
          MeetingStructure.STRUCTURED,
        ),
      ).toBe(0);
      expect(calculateMeetingStructureScore(null, MeetingStructure.OPEN)).toBe(
        0,
      );
    });

    it('scores meeting cadence as binary compatibility', () => {
      expect(
        calculateMeetingCadenceScore(
          MeetingCadence.FORTNIGHTLY,
          MeetingCadence.FORTNIGHTLY,
        ),
      ).toBe(1);
      expect(
        calculateMeetingCadenceScore(
          MeetingCadence.WEEKLY,
          MeetingCadence.MONTHLY,
        ),
      ).toBe(0);
      expect(
        calculateMeetingCadenceScore(undefined, MeetingCadence.WEEKLY),
      ).toBe(0);
    });
  });

  describe('calculateDynamicScore', () => {
    const scores: CategoryScores = {
      disciplines: 1,
      skills: 0.5,
      industries: 0,
      availability: 1,
      location: 1,
      meetingStructure: 0,
      meetingCadence: 1,
    };

    it('calculates a normalized weighted percentage', () => {
      const rules: ActiveRule[] = [
        { categoryKey: 'disciplines', weight: 6 },
        { categoryKey: 'skills', weight: 4 },
      ];
      expect(calculateDynamicScore(scores, rules)).toBe(80);
    });

    it('returns zero for no usable positive weight', () => {
      expect(calculateDynamicScore(scores, [])).toBe(0);
      expect(
        calculateDynamicScore(scores, [
          { categoryKey: 'disciplines', weight: 0 },
          { categoryKey: 'skills', weight: -10 },
        ]),
      ).toBe(0);
    });

    it('ignores invalid weights instead of corrupting the total', () => {
      const rules: ActiveRule[] = [
        { categoryKey: 'disciplines', weight: 10 },
        { categoryKey: 'skills', weight: Number.NaN },
      ];
      expect(calculateDynamicScore(scores, rules)).toBe(100);
    });

    it('always returns a score inside 0..100', () => {
      const malformedScores = {
        ...scores,
        disciplines: 2,
        skills: -1,
      };
      const rules: ActiveRule[] = [
        { categoryKey: 'disciplines', weight: 1 },
        { categoryKey: 'skills', weight: 1 },
      ];
      expect(calculateDynamicScore(malformedScores, rules)).toBe(50);
    });
  });

  describe('computeAllCategoryScores', () => {
    const mentee = {
      goalDisciplines: [
        {
          disciplineId: 'disc-1',
          discipline: { id: 'disc-1', name: 'Old name' },
        },
        { disciplineId: 'disc-2', discipline: { id: 'disc-2', name: 'Data' } },
      ],
      wantedSkills: [
        { skillId: 'skill-1', skill: { id: 'skill-1', name: 'TypeScript' } },
        { skillId: 'skill-2', skill: { id: 'skill-2', name: 'Python' } },
      ],
      targetedIndustries: [
        { industryId: 'ind-1', industry: { id: 'ind-1', name: 'Technology' } },
      ],
      availability: [
        AvailabilityOption.WEEKDAY_EVENING,
        AvailabilityOption.WEEKEND_MORNING,
      ],
      region: Region.LONDON,
      openToRemote: false,
      meetingStructure: MeetingStructure.OPEN,
      meetingCadence: MeetingCadence.FORTNIGHTLY,
    } as unknown as MenteeWithRelations;

    const mentor = {
      mentorDisciplines: [
        {
          disciplineId: 'disc-1',
          discipline: {
            id: 'disc-1',
            name: 'Completely renamed display label',
          },
        },
      ],
      mentorSkills: [
        { skillId: 'skill-1', skill: { id: 'skill-1', name: 'TS' } },
      ],
      mentorDomainIndustries: [
        {
          industryId: 'ind-99',
          industry: { id: 'ind-99', name: 'Healthcare' },
        },
      ],
      availability: [AvailabilityOption.WEEKDAY_EVENING],
      region: Region.CAPE_TOWN,
      openToRemote: true,
      meetingStructure: MeetingStructure.STRUCTURED,
      meetingCadence: MeetingCadence.FORTNIGHTLY,
    } as unknown as MentorWithRelations;

    it('computes every category from canonical IDs and preferences', () => {
      expect(computeAllCategoryScores(mentee, mentor)).toEqual({
        disciplines: 0.5,
        skills: 0.5,
        industries: 0,
        availability: 0.5,
        location: 0,
        meetingStructure: 0,
        meetingCadence: 1,
      });
    });

    it('treats empty mentee discipline/skill/industry preferences as unrestricted', () => {
      const unrestricted = {
        ...mentee,
        goalDisciplines: [],
        wantedSkills: [],
        targetedIndustries: [],
      } as unknown as MenteeWithRelations;

      const result = computeAllCategoryScores(unrestricted, mentor);
      expect(result.disciplines).toBe(1);
      expect(result.skills).toBe(1);
      expect(result.industries).toBe(1);
    });
  });
});
