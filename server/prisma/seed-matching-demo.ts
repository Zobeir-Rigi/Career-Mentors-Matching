/**
 * Deterministic demo seed for the mentor-matching flow.
 *
 * Suggested repo location:
 *   server/prisma/seeding-matching-demo.ts
 *
 * This seed is designed for the real frontend signup/profile flow:
 *   1. Run this seed.
 *   2. Sign up a NEW mentee through the UI.
 *   3. Fill the mentee profile using the exact demo form values printed below.
 *   4. Save the profile and open the dashboard.
 *   5. Click "Find me a mentor".
 *
 * Important:
 * - Every discipline, skill/mentorship goal, industry, availability option,
 *   meeting cadence, meeting structure and region used below comes from the
 *   frontend's current ProfileOptions.tsx values.
 * - No demo mentee is pre-created, because that would bypass the signup and
 *   profile-completion flow the team wants to demonstrate.
 * - Seeded mentors are approved, accepting mentees and have spare capacity.
 * - Matches involving these demo mentors are cleared on each run so capacity
 *   cannot make the demo nondeterministic.
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import {
  ApprovalStatus,
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  Region,
  Role,
} from '../src/generated/prisma/enums';
import { hashPassword } from '../src/auth/helpers/hash-password';

import {
  DISCIPLINE_OPTIONS,
  INDUSTRY_OPTIONS,
  SKILL_OPTIONS,
  type DisciplineOption,
  type IndustryOption,
  type SkillOption,
} from './seeds/reference-data';

const LOCAL_COMPOSE_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5435/mentor_matching';

const connectionString = process.env.DATABASE_URL ?? LOCAL_COMPOSE_DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = process.env.MATCHING_DEMO_PASSWORD ?? 'MatchingDemo123!';

const MATCHING_CONFIG_ID = '00000000-0000-4000-8000-000000000001';

// ---------------------------------------------------------------------------
// Exact frontend ProfileOptions.tsx values
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Matching configuration
// ---------------------------------------------------------------------------

const DEMO_WEIGHTS = [
  { categoryKey: 'disciplines', weight: 25 },
  { categoryKey: 'skills', weight: 25 },
  { categoryKey: 'availability', weight: 20 },
  { categoryKey: 'location', weight: 10 },
  { categoryKey: 'industries', weight: 10 },
  { categoryKey: 'meetingStructure', weight: 5 },
  { categoryKey: 'meetingCadence', weight: 5 },
];

const DEMO_THRESHOLD = 60;

// ---------------------------------------------------------------------------
// Profile values to enter manually through the mentee UI during the demo.
// These are NOT inserted as a MenteeProfile by this seed.
// ---------------------------------------------------------------------------

const DEMO_MENTEE_FORM = {
  currentJobTitle: 'Junior Software Engineer',
  reasonsNote:
    'I want support growing my technical skills and making good career decisions.',
  bio: 'Early-career developer looking for practical guidance and confidence.',
  linkedinURL: 'https://www.linkedin.com/in/demo-mentee',
  scheduleURL: '',
  region: Region.LONDON,
  openToRemote: true,
  availability: [
    AvailabilityOption.WEEKDAY_EVENING,
    AvailabilityOption.WEEKEND_MORNING,
  ],
  disciplines: [
    'Software Engineering',
    'Data Engineering',
  ] satisfies DisciplineOption[],
  skills: ['Technical growth', 'Career advice'] satisfies SkillOption[],
  industries: [
    'Technology & Telecoms',
    'Finance & Insurance',
  ] satisfies IndustryOption[],
  meetingCadence: MeetingCadence.FORTNIGHTLY,
  meetingStructure: MeetingStructure.STRUCTURED,
};

type MentorSeed = {
  fullName: string;
  email: string;
  currentJobTitle: string;
  bio: string;
  linkedinURL: string;
  scheduleURL: string;
  capacity: number;
  region: Region;
  openToRemote: boolean;
  availability: AvailabilityOption[];
  meetingCadence: MeetingCadence;
  meetingStructure: MeetingStructure;
  disciplines: DisciplineOption[];
  skills: SkillOption[];
  industries: IndustryOption[];
  expectedScore: number;
};

// These profiles intentionally reproduce a useful ranking against
// DEMO_MENTEE_FORM while using only values selectable in the frontend.
const demoMentors: MentorSeed[] = [
  {
    fullName: 'Amina Patel',
    email: 'matching.demo.mentor1@example.com',
    currentJobTitle: 'Principal Software Engineer',
    bio: 'Backend and platform engineer who mentors early-career developers on technical growth and career decisions.',
    linkedinURL: 'https://www.linkedin.com/in/demo-amina-patel',
    scheduleURL: 'https://calendly.com/demo-amina-patel/chemistry',
    capacity: 3,
    region: Region.LONDON,
    openToRemote: true,
    availability: [
      AvailabilityOption.WEEKDAY_EVENING,
      AvailabilityOption.WEEKEND_MORNING,
    ],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    disciplines: ['Software Engineering', 'Data Engineering'],
    skills: ['Technical growth', 'Career advice'],
    industries: ['Technology & Telecoms', 'Finance & Insurance'],
    expectedScore: 100,
  },
  {
    fullName: 'Marcus Chen',
    email: 'matching.demo.mentor2@example.com',
    currentJobTitle: 'Staff Backend Engineer',
    bio: 'Backend specialist focused on APIs, distributed systems and helping developers deepen their technical skills.',
    linkedinURL: 'https://www.linkedin.com/in/demo-marcus-chen',
    scheduleURL: 'https://calendly.com/demo-marcus-chen/chemistry',
    capacity: 2,
    region: Region.NORTH_WEST,
    openToRemote: true,
    availability: [
      AvailabilityOption.WEEKDAY_EVENING,
      AvailabilityOption.WEEKEND_MORNING,
    ],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    disciplines: ['Software Engineering', 'Data Engineering'],
    skills: ['Technical growth'],
    industries: ['Technology & Telecoms', 'Finance & Insurance'],
    expectedScore: 88,
  },
  {
    fullName: 'Lerato Ndlovu',
    email: 'matching.demo.mentor3@example.com',
    currentJobTitle: 'Senior Data Platform Engineer',
    bio: 'Data platform engineer with experience coaching developers through technical growth and career progression.',
    linkedinURL: 'https://www.linkedin.com/in/demo-lerato-ndlovu',
    scheduleURL: 'https://calendly.com/demo-lerato-ndlovu/chemistry',
    capacity: 2,
    region: Region.CAPE_TOWN,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKDAY_EVENING],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    disciplines: ['Software Engineering', 'Data Engineering'],
    skills: ['Career advice'],
    industries: ['Technology & Telecoms'],
    expectedScore: 73,
  },
  {
    fullName: 'Sophie Williams',
    email: 'matching.demo.mentor4@example.com',
    currentJobTitle: 'Engineering Manager',
    bio: 'Engineering manager with a software background and an open coaching style focused on career and technical development.',
    linkedinURL: 'https://www.linkedin.com/in/demo-sophie-williams',
    scheduleURL: 'https://calendly.com/demo-sophie-williams/chemistry',
    capacity: 4,
    region: Region.LONDON,
    openToRemote: false,
    availability: [
      AvailabilityOption.WEEKDAY_EVENING,
      AvailabilityOption.WEEKEND_MORNING,
    ],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.OPEN,
    disciplines: ['Software Engineering'],
    skills: ['Technical growth'],
    industries: ['Technology & Telecoms', 'Finance & Insurance'],
    expectedScore: 70,
  },
  {
    fullName: 'Jamie MacLeod',
    email: 'matching.demo.mentor5@example.com',
    currentJobTitle: 'Senior Software Engineer',
    bio: 'Software engineer with finance-sector experience and a structured mentoring approach.',
    linkedinURL: 'https://www.linkedin.com/in/demo-jamie-macleod',
    scheduleURL: 'https://calendly.com/demo-jamie-macleod/chemistry',
    capacity: 2,
    region: Region.SCOTLAND,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKEND_MORNING],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    disciplines: ['Data Engineering'],
    skills: ['Career advice'],
    industries: ['Finance & Insurance'],
    expectedScore: 60,
  },
];

function assertSeedUsesFrontendOptions() {
  const disciplines = new Set<string>(DISCIPLINE_OPTIONS);
  const skills = new Set<string>(SKILL_OPTIONS);
  const industries = new Set<string>(INDUSTRY_OPTIONS);

  const profiles = [DEMO_MENTEE_FORM, ...demoMentors];

  for (const profile of profiles) {
    for (const value of profile.disciplines) {
      if (!disciplines.has(value)) {
        throw new Error(`Invalid seeded discipline: ${value}`);
      }
    }

    for (const value of profile.skills) {
      if (!skills.has(value)) {
        throw new Error(`Invalid seeded skill/mentorship option: ${value}`);
      }
    }

    for (const value of profile.industries) {
      if (!industries.has(value)) {
        throw new Error(`Invalid seeded industry: ${value}`);
      }
    }
  }
}

async function upsertFrontendReferenceData() {
  const disciplines = await Promise.all(
    DISCIPLINE_OPTIONS.map((name) =>
      prisma.discipline.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const skills = await Promise.all(
    SKILL_OPTIONS.map((name) =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const industries = await Promise.all(
    INDUSTRY_OPTIONS.map((name) =>
      prisma.industry.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return {
    disciplineIds: new Map(disciplines.map(({ id, name }) => [name, id])),
    skillIds: new Map(skills.map(({ id, name }) => [name, id])),
    industryIds: new Map(industries.map(({ id, name }) => [name, id])),
  };
}

function getRequiredId(map: Map<string, string>, name: string): string {
  const id = map.get(name);

  if (!id) {
    throw new Error(`Seed reference data missing for: ${name}`);
  }

  return id;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run matching demo seed in production.');
  }

  assertSeedUsesFrontendOptions();

  const passwordHashed = await hashPassword(DEMO_PASSWORD);

  const adminUser = await prisma.user.upsert({
    where: { email: 'matching.demo.admin@example.com' },
    update: {
      fullName: 'Matching Demo Admin',
      role: Role.ADMIN,
      passwordHashed,
      isEmailVerified: true,
      isActive: true,
      deactivatedAt: null,
    },
    create: {
      fullName: 'Matching Demo Admin',
      email: 'matching.demo.admin@example.com',
      role: Role.ADMIN,
      passwordHashed,
      isEmailVerified: true,
      isActive: true,
    },
  });

  // Seed every current frontend reference value, not only the values used by
  // the demo mentors. This keeps the DB reference tables aligned with the UI.
  const referenceData = await upsertFrontendReferenceData();

  const seededMentorProfileIds: string[] = [];

  for (const mentor of demoMentors) {
    const mentorUser = await prisma.user.upsert({
      where: { email: mentor.email },
      update: {
        fullName: mentor.fullName,
        role: Role.MENTOR,
        passwordHashed,
        linkedinURL: mentor.linkedinURL,
        scheduleURL: mentor.scheduleURL,
        isEmailVerified: true,
        isActive: true,
        deactivatedAt: null,
      },
      create: {
        fullName: mentor.fullName,
        email: mentor.email,
        role: Role.MENTOR,
        passwordHashed,
        linkedinURL: mentor.linkedinURL,
        scheduleURL: mentor.scheduleURL,
        isEmailVerified: true,
        isActive: true,
      },
    });

    const mentorProfile = await prisma.mentorProfile.upsert({
      where: { userId: mentorUser.id },
      update: {
        currentJobTitle: mentor.currentJobTitle,
        bio: mentor.bio,
        capacity: mentor.capacity,
        region: mentor.region,
        openToRemote: mentor.openToRemote,
        availability: mentor.availability,
        meetingCadence: mentor.meetingCadence,
        meetingStructure: mentor.meetingStructure,
        isAcceptingMentees: true,
        approvalStatus: ApprovalStatus.ACCEPTED,
        notifiedAdminAt: null,
      },
      create: {
        userId: mentorUser.id,
        currentJobTitle: mentor.currentJobTitle,
        bio: mentor.bio,
        capacity: mentor.capacity,
        region: mentor.region,
        openToRemote: mentor.openToRemote,
        availability: mentor.availability,
        meetingCadence: mentor.meetingCadence,
        meetingStructure: mentor.meetingStructure,
        isAcceptingMentees: true,
        approvalStatus: ApprovalStatus.ACCEPTED,
      },
    });

    seededMentorProfileIds.push(mentorProfile.id);

    await prisma.mentorDisciplines.deleteMany({
      where: { mentorId: mentorProfile.id },
    });
    await prisma.mentorSkills.deleteMany({
      where: { mentorId: mentorProfile.id },
    });
    await prisma.mentorDomainIndustries.deleteMany({
      where: { mentorId: mentorProfile.id },
    });

    await prisma.mentorDisciplines.createMany({
      data: mentor.disciplines.map((name) => ({
        mentorId: mentorProfile.id,
        disciplineId: getRequiredId(referenceData.disciplineIds, name),
      })),
    });

    await prisma.mentorSkills.createMany({
      data: mentor.skills.map((name) => ({
        mentorId: mentorProfile.id,
        skillId: getRequiredId(referenceData.skillIds, name),
      })),
    });

    await prisma.mentorDomainIndustries.createMany({
      data: mentor.industries.map((name) => ({
        mentorId: mentorProfile.id,
        industryId: getRequiredId(referenceData.industryIds, name),
      })),
    });
  }

  // Clear demo-mentor match history so capacity and old demo sessions do not
  // affect a newly signed-up mentee's recommendation list.
  await prisma.matches.deleteMany({
    where: {
      mentorId: { in: seededMentorProfileIds },
    },
  });

  // Make this local demo deterministic even if another config was active.
  await prisma.matchingConfig.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  await prisma.matchingConfig.upsert({
    where: { id: MATCHING_CONFIG_ID },
    update: {
      weights: DEMO_WEIGHTS,
      minScoreThreshold: DEMO_THRESHOLD,
      isActive: true,
      updatedBy: adminUser.id,
    },
    create: {
      id: MATCHING_CONFIG_ID,
      weights: DEMO_WEIGHTS,
      minScoreThreshold: DEMO_THRESHOLD,
      isActive: true,
      updatedBy: adminUser.id,
    },
  });

  console.log('\nMatching demo seed complete.');
  console.log('\nDemo flow:');
  console.log('  1. Sign up a new MENTEE through the frontend.');
  console.log(
    "  2. Log in after completing the app's normal verification flow.",
  );
  console.log('  3. Fill the profile with these exact UI values:');
  console.log(`     Current job title: ${DEMO_MENTEE_FORM.currentJobTitle}`);
  console.log(`     Reason: ${DEMO_MENTEE_FORM.reasonsNote}`);
  console.log(`     Bio: ${DEMO_MENTEE_FORM.bio}`);
  console.log(`     LinkedIn: ${DEMO_MENTEE_FORM.linkedinURL}`);
  console.log(`     Region: ${DEMO_MENTEE_FORM.region}`);
  console.log(`     Open to remote: ${DEMO_MENTEE_FORM.openToRemote}`);
  console.log(`     Availability: ${DEMO_MENTEE_FORM.availability.join(', ')}`);
  console.log(`     Goals: ${DEMO_MENTEE_FORM.disciplines.join(', ')}`);
  console.log(`     Mentorship wants: ${DEMO_MENTEE_FORM.skills.join(', ')}`);
  console.log(`     Industries: ${DEMO_MENTEE_FORM.industries.join(', ')}`);
  console.log(`     Meeting cadence: ${DEMO_MENTEE_FORM.meetingCadence}`);
  console.log(`     Meeting structure: ${DEMO_MENTEE_FORM.meetingStructure}`);
  console.log('  4. Save the profile and go to the mentee dashboard.');
  console.log('  5. Click "Find me a mentor".');

  console.log('\nExpected recommendation order:');
  demoMentors.forEach((mentor, index) => {
    console.log(
      `  ${index + 1}. ${mentor.fullName.padEnd(18)} ${mentor.expectedScore}%`,
    );
  });

  console.log(
    `\nAll five mentors are at or above the ${DEMO_THRESHOLD}% threshold.`,
  );
  console.log(
    'All seeded relation values are values the current frontend can submit.',
  );
}

main()
  .catch((error) => {
    console.error('Matching demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
