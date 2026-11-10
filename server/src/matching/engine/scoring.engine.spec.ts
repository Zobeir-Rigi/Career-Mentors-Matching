import {
  calculateArrayOverlapScore,
  calculateDynamicScore,
  calculateLocationScore,
  calculateMeetingCadenceScore,
  calculateMeetingStructureScore,
  computeAllCategoryScores,
  type ActiveRule,
  type CategoryScores,
} from './scoring.engine';
import {
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  Region,
} from './scoring.types';

describe('Scoring Engine', () => {
  describe('calculateArrayOverlapScore', () => {
    it.each([
      [['TypeScript', 'React'], ['TypeScript', 'React', 'Node'], 0.9375],
      [['TypeScript', 'React', 'Python'], ['TypeScript', 'Node'], 0.75],
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
      ).toBe(0.75);
    });

    it('does not reduce a mentor score when the mentee adds unmatched acceptable preferences', () => {
      const narrow = calculateArrayOverlapScore(['TypeScript'], ['TypeScript']);

      const broader = calculateArrayOverlapScore(
        ['TypeScript', 'React', 'Python', 'Java'],
        ['TypeScript'],
      );

      expect(narrow).toBe(0.75);
      expect(broader).toBe(0.75);
    });

    it('rewards each additional actual overlap', () => {
      const oneOverlap = calculateArrayOverlapScore(
        ['TypeScript', 'React', 'Python'],
        ['TypeScript'],
      );

      const twoOverlaps = calculateArrayOverlapScore(
        ['TypeScript', 'React', 'Python'],
        ['TypeScript', 'React'],
      );

      const threeOverlaps = calculateArrayOverlapScore(
        ['TypeScript', 'React', 'Python'],
        ['TypeScript', 'React', 'Python'],
      );

      expect(oneOverlap).toBeCloseTo(0.75);
      expect(twoOverlaps).toBeCloseTo(0.9375);
      expect(threeOverlaps).toBeCloseTo(0.984375);

      expect(twoOverlaps).toBeGreaterThan(oneOverlap);
      expect(threeOverlaps).toBeGreaterThan(twoOverlaps);
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
    it('awards location points when both opt in and share a region', () => {
      expect(
        calculateLocationScore(Region.LONDON, Region.LONDON, true, true),
      ).toBe(1);
    });

    it.each([
      [true, false],
      [false, true],
      [false, false],
    ])(
      'requires both people to opt in (%p/%p)',
      (menteeInPerson, mentorInPerson) => {
        expect(
          calculateLocationScore(
            Region.LONDON,
            Region.LONDON,
            menteeInPerson,
            mentorInPerson,
          ),
        ).toBe(0);
      },
    );

    it('awards no location points across different regions even when both opt in', () => {
      expect(
        calculateLocationScore(Region.LONDON, Region.CAPE_TOWN, true, true),
      ).toBe(0);
    });

    it.each([
      [null, Region.LONDON],
      [Region.LONDON, undefined],
      [null, undefined],
    ])(
      'requires both regions to be known (%p/%p)',
      (menteeRegion, mentorRegion) => {
        expect(
          calculateLocationScore(menteeRegion, mentorRegion, true, true),
        ).toBe(0);
      },
    );
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
      goalDisciplineIds: ['disc-1', 'disc-2'],
      wantedSkillIds: ['skill-1', 'skill-2'],
      targetedIndustryIds: ['ind-1'],
      availability: [
        AvailabilityOption.WEEKDAY_EVENING,
        AvailabilityOption.WEEKEND_MORNING,
      ],
      region: Region.LONDON,
      openToInPerson: false,
      meetingStructure: MeetingStructure.OPEN,
      meetingCadence: MeetingCadence.FORTNIGHTLY,
    };

    const mentor = {
      mentorDisciplineIds: ['disc-1'],
      mentorSkillIds: ['skill-1'],
      mentorDomainIndustryIds: ['ind-99'],
      availability: [AvailabilityOption.WEEKDAY_EVENING],
      region: Region.CAPE_TOWN,
      openToInPerson: true,
      meetingStructure: MeetingStructure.STRUCTURED,
      meetingCadence: MeetingCadence.FORTNIGHTLY,
    };

    it('computes every category from canonical IDs and preferences', () => {
      expect(computeAllCategoryScores(mentee, mentor)).toEqual({
        disciplines: 0.75,
        skills: 0.75,
        industries: 0,
        availability: 0.75,
        location: 0,
        meetingStructure: 0,
        meetingCadence: 1,
      });
    });

    it('treats empty mentee discipline/skill/industry preferences as unrestricted', () => {
      const unrestricted = {
        ...mentee,
        goalDisciplineIds: [],
        wantedSkillIds: [],
        targetedIndustryIds: [],
      };

      const result = computeAllCategoryScores(unrestricted, mentor);
      expect(result.disciplines).toBe(1);
      expect(result.skills).toBe(1);
      expect(result.industries).toBe(1);
    });
  });
});
