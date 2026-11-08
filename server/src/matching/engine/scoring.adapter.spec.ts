import { toMenteeScoringInput, toMentorScoringInput } from './scoring.adapter';
import {
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  Region,
} from './scoring.types';

describe('toMenteeScoringInput', () => {
  it('extracts IDs and preserves preferences', () => {
    const result = toMenteeScoringInput({
      goalDisciplines: [{ disciplineId: 'disc-1' }, { disciplineId: 'disc-2' }],
      wantedSkills: [{ skillId: 'skill-1' }],
      targetedIndustries: [{ industryId: 'industry-1' }],
      availability: [AvailabilityOption.WEEKDAY_EVENING],
      region: Region.LONDON,
      openToRemote: false,
      meetingStructure: MeetingStructure.OPEN,
      meetingCadence: MeetingCadence.FORTNIGHTLY,
    });

    expect(result).toEqual({
      goalDisciplineIds: ['disc-1', 'disc-2'],
      wantedSkillIds: ['skill-1'],
      targetedIndustryIds: ['industry-1'],
      availability: [AvailabilityOption.WEEKDAY_EVENING],
      region: Region.LONDON,
      openToRemote: false,
      meetingStructure: MeetingStructure.OPEN,
      meetingCadence: MeetingCadence.FORTNIGHTLY,
    });
  });
});

describe('toMentorScoringInput', () => {
  it('extracts IDs and preserves preferences', () => {
    const result = toMentorScoringInput({
      mentorDisciplines: [
        { disciplineId: 'disc-1' },
        { disciplineId: 'disc-2' },
      ],
      mentorSkills: [{ skillId: 'skill-1' }],
      mentorDomainIndustries: [{ industryId: 'industry-1' }],
      availability: [AvailabilityOption.WEEKDAY_EVENING],
      region: Region.LONDON,
      openToRemote: false,
      meetingStructure: MeetingStructure.OPEN,
      meetingCadence: MeetingCadence.FORTNIGHTLY,
    });

    expect(result).toEqual({
      mentorDisciplineIds: ['disc-1', 'disc-2'],
      mentorSkillIds: ['skill-1'],
      mentorDomainIndustryIds: ['industry-1'],
      availability: [AvailabilityOption.WEEKDAY_EVENING],
      region: Region.LONDON,
      openToRemote: false,
      meetingStructure: MeetingStructure.OPEN,
      meetingCadence: MeetingCadence.FORTNIGHTLY,
    });
  });
});
