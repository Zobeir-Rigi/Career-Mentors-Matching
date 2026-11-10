import type { MenteeScoringInput, MentorScoringInput } from './scoring.engine';

export interface MenteeAdapterInput {
  goalDisciplines: { disciplineId: string }[];
  wantedSkills: { skillId: string }[];
  targetedIndustries: { industryId: string }[];
  availability: MenteeScoringInput['availability'];
  region: MenteeScoringInput['region'];
  openToInPerson: boolean;
  meetingStructure: MenteeScoringInput['meetingStructure'];
  meetingCadence: MenteeScoringInput['meetingCadence'];
}

export interface MentorAdapterInput {
  mentorDisciplines: { disciplineId: string }[];
  mentorSkills: { skillId: string }[];
  mentorDomainIndustries: { industryId: string }[];
  availability: MentorScoringInput['availability'];
  region: MentorScoringInput['region'];
  openToInPerson: boolean;
  meetingStructure: MentorScoringInput['meetingStructure'];
  meetingCadence: MentorScoringInput['meetingCadence'];
}

export function toMenteeScoringInput(
  profile: MenteeAdapterInput,
): MenteeScoringInput {
  return {
    goalDisciplineIds: profile.goalDisciplines.map(
      ({ disciplineId }) => disciplineId,
    ),
    wantedSkillIds: profile.wantedSkills.map(({ skillId }) => skillId),
    targetedIndustryIds: profile.targetedIndustries.map(
      ({ industryId }) => industryId,
    ),
    availability: profile.availability,
    region: profile.region,
    openToInPerson: profile.openToInPerson,
    meetingStructure: profile.meetingStructure,
    meetingCadence: profile.meetingCadence,
  };
}

export function toMentorScoringInput(
  profile: MentorAdapterInput,
): MentorScoringInput {
  return {
    mentorDisciplineIds: profile.mentorDisciplines.map(
      ({ disciplineId }) => disciplineId,
    ),
    mentorSkillIds: profile.mentorSkills.map(({ skillId }) => skillId),
    mentorDomainIndustryIds: profile.mentorDomainIndustries.map(
      ({ industryId }) => industryId,
    ),
    availability: profile.availability,
    region: profile.region,
    openToInPerson: profile.openToInPerson,
    meetingStructure: profile.meetingStructure,
    meetingCadence: profile.meetingCadence,
  };
}
