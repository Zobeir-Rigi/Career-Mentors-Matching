import {
  selectMentorMatches,
  type MentorCandidate,
} from './candidate-selection';
import type { ActiveRule, MenteeScoringInput } from './scoring.engine';

const mentee: MenteeScoringInput = {
  goalDisciplineIds: [],
  wantedSkillIds: ['skill-1'],
  targetedIndustryIds: [],
  availability: [],
  region: null,
  openToInPerson: false,
  meetingStructure: null,
  meetingCadence: null,
};

const mentor: MentorCandidate = {
  mentorId: 'mentor-1',
  isApproved: true,
  isAcceptingMentees: true,
  capacity: 2,
  occupiedCapacity: 0,
  scoringInput: {
    mentorDisciplineIds: [],
    mentorSkillIds: ['skill-1'],
    mentorDomainIndustryIds: [],
    availability: [],
    region: null,
    openToInPerson: false,
    meetingStructure: null,
    meetingCadence: null,
  },
};

const activeRules: ActiveRule[] = [{ categoryKey: 'skills', weight: 1 }];

describe('selectMentorMatches', () => {
  it('returns an eligible mentor above the supplied threshold', () => {
    const results = selectMentorMatches(mentee, [mentor], [], 70, activeRules);

    expect(results).toEqual([
      {
        mentorId: 'mentor-1',
        score: 75,
        categoryScores: {
          disciplines: 1,
          skills: 0.75,
          industries: 1,
          availability: 1,
          location: 0,
          meetingStructure: 0,
          meetingCadence: 0,
        },
      },
    ]);
  });

  it('skips a previously matched mentor', () => {
    const results = selectMentorMatches(
      mentee,
      [mentor],
      ['mentor-1'],
      70,
      activeRules,
    );

    expect(results).toEqual([]);
  });

  it('skips a mentor whose capacity is full', () => {
    const fullMentor: MentorCandidate = {
      ...mentor,
      occupiedCapacity: 2,
    };

    const results = selectMentorMatches(
      mentee,
      [fullMentor],
      [],
      70,
      activeRules,
    );

    expect(results).toEqual([]);
  });

  it('skips a mentor who is not approved', () => {
    const results = selectMentorMatches(
      mentee,
      [{ ...mentor, isApproved: false }],
      [],
      70,
      activeRules,
    );

    expect(results).toEqual([]);
  });

  it('skips a mentor who is not accepting mentees', () => {
    const results = selectMentorMatches(
      mentee,
      [{ ...mentor, isAcceptingMentees: false }],
      [],
      70,
      activeRules,
    );

    expect(results).toEqual([]);
  });

  it('includes a mentor whose score equals the threshold', () => {
    const results = selectMentorMatches(mentee, [mentor], [], 75, activeRules);

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(75);
  });

  it('drops a mentor whose score is below the threshold', () => {
    const results = selectMentorMatches(mentee, [mentor], [], 76, activeRules);

    expect(results).toEqual([]);
  });

  it('sorts mentors by descending score', () => {
    const lowerScoringMentor: MentorCandidate = {
      ...mentor,
      mentorId: 'mentor-low',
      scoringInput: {
        ...mentor.scoringInput,
        mentorSkillIds: ['different-skill'],
      },
    };

    const results = selectMentorMatches(
      mentee,
      [lowerScoringMentor, mentor],
      [],
      0,
      activeRules,
    );

    expect(results.map(({ mentorId, score }) => ({ mentorId, score }))).toEqual(
      [
        { mentorId: 'mentor-1', score: 75 },
        { mentorId: 'mentor-low', score: 0 },
      ],
    );
  });

  it('sorts equal scores by mentor ID', () => {
    const results = selectMentorMatches(
      mentee,
      [
        { ...mentor, mentorId: 'mentor-z' },
        { ...mentor, mentorId: 'mentor-a' },
      ],
      [],
      70,
      activeRules,
    );

    expect(results.map(({ mentorId }) => mentorId)).toEqual([
      'mentor-a',
      'mentor-z',
    ]);
  });
});
