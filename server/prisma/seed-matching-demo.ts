/**
 * Demo seed for the mentor-matching flow.
 *
 * Suggested repo location: prisma/seed-matching-demo.ts
 *
 * Creates:
 * - 1 demo admin (owns the active MatchingConfig)
 * - 1 demo mentee with deterministic matching preferences
 * - 5 approved, accepting mentors with intentionally different scores
 * - shared Discipline / Skill / Industry records and join-table relations
 * - 1 active matching configuration using `meetingStructure`
 *
 * The seed is intentionally repeatable. It clears Matches involving the demo
 * mentee/mentors so "Find me a mentor" produces the same ranking on every run.
 */

import {
  ApprovalStatus,
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  Region,
  Role,
} from '../src/generated/prisma/enums';
import { hashPassword } from '../src/auth/helpers/hash-password';

import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const LOCAL_COMPOSE_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5435/mentor_matching';

const connectionString = process.env.DATABASE_URL ?? LOCAL_COMPOSE_DATABASE_URL;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = process.env.MATCHING_DEMO_PASSWORD ?? 'MatchingDemo123!';

const MATCHING_CONFIG_ID = '00000000-0000-4000-8000-000000000001';

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

const demoMentee = {
  fullName: 'Demo Mentee',
  email: 'matching.demo.mentee@example.com',
  currentJobTitle: 'Junior Software Engineer',
  bio: 'Looking for guidance growing as a backend engineer.',
  reasonsNote: 'I want support with backend engineering and career growth.',
  region: Region.LONDON,
  openToRemote: true,
  availability: [
    AvailabilityOption.WEEKDAY_EVENING,
    AvailabilityOption.WEEKEND_MORNING,
  ],
  meetingCadence: MeetingCadence.FORTNIGHTLY,
  meetingStructure: MeetingStructure.STRUCTURED,
  disciplines: ['Software Engineering', 'Data Engineering'],
  skills: ['TypeScript', 'Node.js'],
  industries: ['Technology', 'Fintech'],
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
  disciplines: string[];
  skills: string[];
  industries: string[];
  expectedScore: number;
};

const demoMentors: MentorSeed[] = [
  {
    fullName: 'Amina Patel',
    email: 'matching.demo.mentor1@example.com',
    currentJobTitle: 'Principal Software Engineer',
    bio: 'Backend and platform engineer with experience mentoring early-career developers.',
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
    skills: ['TypeScript', 'Node.js'],
    industries: ['Technology', 'Fintech'],
    expectedScore: 100,
  },
  {
    fullName: 'Marcus Chen',
    email: 'matching.demo.mentor2@example.com',
    currentJobTitle: 'Staff Backend Engineer',
    bio: 'Backend specialist focused on TypeScript services, APIs, and distributed systems.',
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
    skills: ['TypeScript'],
    industries: ['Technology', 'Fintech'],
    expectedScore: 88,
  },
  {
    fullName: 'Lerato Ndlovu',
    email: 'matching.demo.mentor3@example.com',
    currentJobTitle: 'Senior Data Platform Engineer',
    bio: 'Data-platform engineer working across backend services, pipelines, and developer mentoring.',
    linkedinURL: 'https://www.linkedin.com/in/demo-lerato-ndlovu',
    scheduleURL: 'https://calendly.com/demo-lerato-ndlovu/chemistry',
    capacity: 2,
    region: Region.CAPE_TOWN,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKDAY_EVENING],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    disciplines: ['Software Engineering', 'Data Engineering'],
    skills: ['Node.js'],
    industries: ['Technology'],
    expectedScore: 73,
  },
  {
    fullName: 'Sophie Williams',
    email: 'matching.demo.mentor4@example.com',
    currentJobTitle: 'Engineering Manager',
    bio: 'Engineering manager with a software background and a practical coaching style.',
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
    skills: ['TypeScript'],
    industries: ['Technology', 'Fintech'],
    expectedScore: 70,
  },
  {
    fullName: 'Jamie MacLeod',
    email: 'matching.demo.mentor5@example.com',
    currentJobTitle: 'Senior Node.js Engineer',
    bio: 'Node.js engineer with fintech experience and a structured mentoring approach.',
    linkedinURL: 'https://www.linkedin.com/in/demo-jamie-macleod',
    scheduleURL: 'https://calendly.com/demo-jamie-macleod/chemistry',
    capacity: 2,
    region: Region.SCOTLAND,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKEND_MORNING],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    disciplines: ['Data Engineering'],
    skills: ['Node.js'],
    industries: ['Fintech'],
    expectedScore: 60,
  },
];

async function upsertNamedReferenceData() {
  const disciplineNames = [
    ...new Set([
      ...demoMentee.disciplines,
      ...demoMentors.flatMap((mentor) => mentor.disciplines),
    ]),
  ];
  const skillNames = [
    ...new Set([
      ...demoMentee.skills,
      ...demoMentors.flatMap((mentor) => mentor.skills),
    ]),
  ];
  const industryNames = [
    ...new Set([
      ...demoMentee.industries,
      ...demoMentors.flatMap((mentor) => mentor.industries),
    ]),
  ];

  const disciplines = await Promise.all(
    disciplineNames.map((name) =>
      prisma.discipline.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const skills = await Promise.all(
    skillNames.map((name) =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const industries = await Promise.all(
    industryNames.map((name) =>
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

  const menteeUser = await prisma.user.upsert({
    where: { email: demoMentee.email },
    update: {
      fullName: demoMentee.fullName,
      role: Role.MENTEE,
      passwordHashed,
      isEmailVerified: true,
      isActive: true,
      deactivatedAt: null,
    },
    create: {
      fullName: demoMentee.fullName,
      email: demoMentee.email,
      role: Role.MENTEE,
      passwordHashed,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const menteeProfile = await prisma.menteeProfile.upsert({
    where: { userId: menteeUser.id },
    update: {
      currentJobTitle: demoMentee.currentJobTitle,
      bio: demoMentee.bio,
      reasonsNote: demoMentee.reasonsNote,
      region: demoMentee.region,
      openToRemote: demoMentee.openToRemote,
      availability: demoMentee.availability,
      meetingCadence: demoMentee.meetingCadence,
      meetingStructure: demoMentee.meetingStructure,
    },
    create: {
      userId: menteeUser.id,
      currentJobTitle: demoMentee.currentJobTitle,
      bio: demoMentee.bio,
      reasonsNote: demoMentee.reasonsNote,
      region: demoMentee.region,
      openToRemote: demoMentee.openToRemote,
      availability: demoMentee.availability,
      meetingCadence: demoMentee.meetingCadence,
      meetingStructure: demoMentee.meetingStructure,
    },
  });

  const referenceData = await upsertNamedReferenceData();

  await prisma.menteeGoalDisciplines.deleteMany({
    where: { menteeId: menteeProfile.id },
  });
  await prisma.menteeWantedSkills.deleteMany({
    where: { menteeId: menteeProfile.id },
  });
  await prisma.menteeTargetedIndustries.deleteMany({
    where: { menteeId: menteeProfile.id },
  });

  await prisma.menteeGoalDisciplines.createMany({
    data: demoMentee.disciplines.map((name) => ({
      menteeId: menteeProfile.id,
      disciplineId: getRequiredId(referenceData.disciplineIds, name),
    })),
  });

  await prisma.menteeWantedSkills.createMany({
    data: demoMentee.skills.map((name) => ({
      menteeId: menteeProfile.id,
      skillId: getRequiredId(referenceData.skillIds, name),
    })),
  });

  await prisma.menteeTargetedIndustries.createMany({
    data: demoMentee.industries.map((name) => ({
      menteeId: menteeProfile.id,
      industryId: getRequiredId(referenceData.industryIds, name),
    })),
  });

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

  // Reset the demo matching history so every run is deterministic. The current
  // algorithm excludes mentors that have already appeared in a mentee's match
  // history, regardless of status.
  await prisma.matches.deleteMany({
    where: {
      OR: [
        { menteeId: menteeProfile.id },
        { mentorId: { in: seededMentorProfileIds } },
      ],
    },
  });

  // Keep this demo deterministic even if a developer already has another active
  // config locally. This file is guarded from running in production above.
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
  console.log('Demo mentee login:');
  console.log(`  email:    ${demoMentee.email}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log('\nExpected recommendation order:');

  demoMentors.forEach((mentor, index) => {
    console.log(
      `  ${index + 1}. ${mentor.fullName.padEnd(18)} ${mentor.expectedScore}%`,
    );
  });

  console.log(
    `\nAll five mentors are at or above the ${DEMO_THRESHOLD}% threshold.`,
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
