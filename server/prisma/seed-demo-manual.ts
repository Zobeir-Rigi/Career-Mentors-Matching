/**
 * Manual demo seed for the deployed mentor-matching app.
 *
 * Suggested location:
 *   server/prisma/seed-demo-manual.ts
 *
 * Goals:
 * - deterministic admin / mentor / mentee login accounts
 * - enough approved mentors to exercise ranking
 * - a mentee who has good matches
 * - a mentee who has NO eligible mentor above the 60% threshold
 * - pending mentor profiles visible to admin for approval
 * - waiting-list mentees visible to admin
 * - idempotent: safe to re-run against the same dedicated demo database
 *
 * IMPORTANT:
 * This seed intentionally makes one matching config active so the demo is
 * deterministic. Run it only against a dedicated demo/staging database.
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client';
import {
  ApprovalStatus,
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  Region,
  Role,
  WaitingStatus,
} from '../src/generated/prisma/enums';
import { hashPassword } from '../src/auth/helpers/hash-password';

const connectionString =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DIRECT_DATABASE_URL or DATABASE_URL is required to seed the database.',
  );
}

if (process.env.ALLOW_DEMO_SEED !== 'true') {
  throw new Error(
    'Refusing to seed. Set ALLOW_DEMO_SEED=true only for the dedicated demo/staging database.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Demo123!';
const DEMO_MATCHING_CONFIG_ID = '00000000-0000-4000-8000-000000000101';
const DEMO_THRESHOLD = 60;

type ScoringCategoryKey =
  | 'disciplines'
  | 'skills'
  | 'availability'
  | 'location'
  | 'industries'
  | 'meetingStructure'
  | 'meetingCadence';

const DEMO_WEIGHTS = [
  { categoryKey: 'disciplines', weight: 25 },
  { categoryKey: 'skills', weight: 25 },
  { categoryKey: 'availability', weight: 20 },
  { categoryKey: 'location', weight: 10 },
  { categoryKey: 'industries', weight: 10 },
  { categoryKey: 'meetingStructure', weight: 5 },
  { categoryKey: 'meetingCadence', weight: 5 },
] satisfies Array<{ categoryKey: ScoringCategoryKey; weight: number }>;

// Keep these values aligned with frontend/src/lib/ProfileOptions.tsx.
const DISCIPLINE_OPTIONS = [
  'Software Engineering',
  'Data & Analytics',
  'Data Engineering',
  'DevOps, Cloud & Platform',
  'Cybersecurity',
  'QA & Testing',
  'Product & Project Management',
  'Business Analysis',
  'UX & Design',
  'Career Development & Interview Prep',
  'Leadership & Management',
  'AI & Machine Learning',
] as const;

const SKILL_OPTIONS = [
  'Career advice',
  'Interview prep',
  'Technical growth',
  'Confidence',
  'LinkedIn Optimisation',
  'CV',
  'Career transition',
  'Soft skills',
  'Networking',
  'Job search',
] as const;

const INDUSTRY_OPTIONS = [
  'Agriculture & Natural Resources',
  'Construction & Real Estate',
  'Manufacturing & Industrial',
  'Technology & Telecoms',
  'Finance & Insurance',
  'Healthcare & Life Sciences',
  'Retail & Consumer Goods',
  'Hospitality & Leisure',
  'Transportation & Logistics',
  'Professional & Business Services',
  'Education & Training',
  'Public Sector & Non-Profit',
] as const;

type DisciplineOption = (typeof DISCIPLINE_OPTIONS)[number];
type SkillOption = (typeof SKILL_OPTIONS)[number];
type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];

type UserSeed = {
  fullName: string;
  email: string;
  role: Role;
  linkedinURL?: string;
  scheduleURL?: string;
};

type MentorSeed = UserSeed & {
  role: typeof Role.MENTOR;
  currentJobTitle: string;
  capacity: number;
  region: Region;
  openToRemote: boolean;
  availability: AvailabilityOption[];
  meetingCadence: MeetingCadence;
  meetingStructure: MeetingStructure;
  bio: string;
  isAcceptingMentees: boolean;
  approvalStatus: ApprovalStatus;
  disciplines: DisciplineOption[];
  skills: SkillOption[];
  industries: IndustryOption[];
  note: string;
};

type MenteeSeed = UserSeed & {
  role: typeof Role.MENTEE;
  currentJobTitle?: string;
  reasonsNote?: string;
  region?: Region;
  openToRemote: boolean;
  availability: AvailabilityOption[];
  meetingCadence?: MeetingCadence;
  meetingStructure?: MeetingStructure;
  bio?: string;
  disciplines: DisciplineOption[];
  skills: SkillOption[];
  industries: IndustryOption[];
  waitingStatus?: WaitingStatus;
  note: string;
};

const ADMIN: UserSeed = {
  fullName: 'Demo Admin',
  email: 'admin.demo@example.com',
  role: Role.ADMIN,
};

// The first five mentors are eligible matcher candidates.
// The last two are complete profiles but PENDING approval and therefore must
// NOT be considered by the matcher until an admin approves them.
const MENTORS = [
  {
    fullName: 'Amina Patel',
    email: 'mentor.amina@example.com',
    role: Role.MENTOR,
    linkedinURL: 'https://www.linkedin.com/in/demo-amina-patel',
    scheduleURL: 'https://calendly.com/demo-amina-patel/mentoring',
    currentJobTitle: 'Principal Software Engineer',
    capacity: 3,
    region: Region.LONDON,
    openToRemote: true,
    availability: [
      AvailabilityOption.WEEKDAY_EVENING,
      AvailabilityOption.WEEKEND_MORNING,
    ],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    bio: 'Backend and platform engineer mentoring early-career developers on technical growth and career decisions.',
    isAcceptingMentees: true,
    approvalStatus: ApprovalStatus.ACCEPTED,
    disciplines: ['Software Engineering', 'Data Engineering'],
    skills: ['Technical growth', 'Career advice'],
    industries: ['Technology & Telecoms', 'Finance & Insurance'],
    note: 'Eligible; perfect profile for mentee.match.',
  },
  {
    fullName: 'Marcus Chen',
    email: 'mentor.marcus@example.com',
    role: Role.MENTOR,
    linkedinURL: 'https://www.linkedin.com/in/demo-marcus-chen',
    scheduleURL: 'https://calendly.com/demo-marcus-chen/mentoring',
    currentJobTitle: 'Staff Backend Engineer',
    capacity: 2,
    region: Region.NORTH_WEST,
    openToRemote: true,
    availability: [
      AvailabilityOption.WEEKDAY_EVENING,
      AvailabilityOption.WEEKEND_MORNING,
    ],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    bio: 'Backend specialist focused on APIs, distributed systems and practical technical coaching.',
    isAcceptingMentees: true,
    approvalStatus: ApprovalStatus.ACCEPTED,
    disciplines: ['Software Engineering', 'Data Engineering'],
    skills: ['Technical growth'],
    industries: ['Technology & Telecoms', 'Finance & Insurance'],
    note: 'Eligible; strong but not perfect match for mentee.match.',
  },
  {
    fullName: 'Lerato Ndlovu',
    email: 'mentor.lerato@example.com',
    role: Role.MENTOR,
    linkedinURL: 'https://www.linkedin.com/in/demo-lerato-ndlovu',
    scheduleURL: 'https://calendly.com/demo-lerato-ndlovu/mentoring',
    currentJobTitle: 'Senior Data Platform Engineer',
    capacity: 2,
    region: Region.CAPE_TOWN,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKDAY_EVENING],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    bio: 'Data platform engineer helping developers grow into production data and backend roles.',
    isAcceptingMentees: true,
    approvalStatus: ApprovalStatus.ACCEPTED,
    disciplines: ['Software Engineering', 'Data Engineering'],
    skills: ['Career advice'],
    industries: ['Technology & Telecoms'],
    note: 'Eligible; medium match for mentee.match.',
  },
  {
    fullName: 'Sophie Williams',
    email: 'mentor.sophie@example.com',
    role: Role.MENTOR,
    linkedinURL: 'https://www.linkedin.com/in/demo-sophie-williams',
    scheduleURL: 'https://calendly.com/demo-sophie-williams/mentoring',
    currentJobTitle: 'Engineering Manager',
    capacity: 4,
    region: Region.LONDON,
    openToRemote: false,
    availability: [
      AvailabilityOption.WEEKDAY_EVENING,
      AvailabilityOption.WEEKEND_MORNING,
    ],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.OPEN,
    bio: 'Engineering manager coaching career growth, interviews and software engineering fundamentals.',
    isAcceptingMentees: true,
    approvalStatus: ApprovalStatus.ACCEPTED,
    disciplines: ['Software Engineering'],
    skills: ['Technical growth'],
    industries: ['Technology & Telecoms', 'Finance & Insurance'],
    note: 'Eligible; lower but still useful match for mentee.match.',
  },
  {
    fullName: 'Jamie MacLeod',
    email: 'mentor.jamie@example.com',
    role: Role.MENTOR,
    linkedinURL: 'https://www.linkedin.com/in/demo-jamie-macleod',
    scheduleURL: 'https://calendly.com/demo-jamie-macleod/mentoring',
    currentJobTitle: 'Senior Software Engineer',
    capacity: 2,
    region: Region.SCOTLAND,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKEND_MORNING],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    bio: 'Software engineer with finance-sector experience and a structured mentoring approach.',
    isAcceptingMentees: true,
    approvalStatus: ApprovalStatus.ACCEPTED,
    disciplines: ['Data Engineering'],
    skills: ['Career advice'],
    industries: ['Finance & Insurance'],
    note: 'Eligible; designed to sit around the 60% boundary for mentee.match.',
  },
  {
    fullName: 'Noor Ahmed',
    email: 'mentor.pending.cyber@example.com',
    role: Role.MENTOR,
    linkedinURL: 'https://www.linkedin.com/in/demo-noor-ahmed',
    scheduleURL: 'https://calendly.com/demo-noor-ahmed/mentoring',
    currentJobTitle: 'Senior Security Engineer',
    capacity: 2,
    region: Region.SHEFFIELD,
    openToRemote: false,
    availability: [AvailabilityOption.WEEKEND_EVENING],
    meetingCadence: MeetingCadence.WEEKLY,
    meetingStructure: MeetingStructure.OPEN,
    bio: 'Security engineer mentoring people moving into cybersecurity and security operations.',
    isAcceptingMentees: true,
    approvalStatus: ApprovalStatus.PENDING,
    disciplines: ['Cybersecurity'],
    skills: ['Job search'],
    industries: ['Healthcare & Life Sciences'],
    note: 'Pending approval; would be an excellent match for mentee.nomatch once approved.',
  },
  {
    fullName: 'Imani Brooks',
    email: 'mentor.pending.ux@example.com',
    role: Role.MENTOR,
    linkedinURL: 'https://www.linkedin.com/in/demo-imani-brooks',
    scheduleURL: 'https://calendly.com/demo-imani-brooks/mentoring',
    currentJobTitle: 'Lead Product Designer',
    capacity: 1,
    region: Region.WEST_MIDLANDS,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKDAY_AFTERNOON],
    meetingCadence: MeetingCadence.MONTHLY,
    meetingStructure: MeetingStructure.MIX,
    bio: 'Product designer mentoring UX practice, portfolio development and career transitions.',
    isAcceptingMentees: true,
    approvalStatus: ApprovalStatus.PENDING,
    disciplines: ['UX & Design'],
    skills: ['Career transition', 'CV'],
    industries: ['Professional & Business Services'],
    note: 'Second pending mentor so the admin approval queue is not a one-row edge case.',
  },
] satisfies MentorSeed[];

const MENTEES = [
  {
    fullName: 'Sam Match',
    email: 'mentee.match@example.com',
    role: Role.MENTEE,
    linkedinURL: 'https://www.linkedin.com/in/demo-sam-match',
    scheduleURL: 'https://calendly.com/demo-sam-match/chat',
    currentJobTitle: 'Junior Software Engineer',
    reasonsNote:
      'I want practical support growing my technical skills and making good career decisions.',
    region: Region.LONDON,
    openToRemote: true,
    availability: [
      AvailabilityOption.WEEKDAY_EVENING,
      AvailabilityOption.WEEKEND_MORNING,
    ],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.STRUCTURED,
    bio: 'Early-career developer looking for practical engineering guidance and confidence.',
    disciplines: ['Software Engineering', 'Data Engineering'],
    skills: ['Technical growth', 'Career advice'],
    industries: ['Technology & Telecoms', 'Finance & Insurance'],
    waitingStatus: WaitingStatus.WAITING,
    note: 'Positive matcher scenario; should receive eligible recommendations.',
  },
  {
    fullName: 'Casey No Match',
    email: 'mentee.nomatch@example.com',
    role: Role.MENTEE,
    linkedinURL: 'https://www.linkedin.com/in/demo-casey-no-match',
    scheduleURL: 'https://calendly.com/demo-casey-no-match/chat',
    currentJobTitle: 'IT Support Analyst',
    reasonsNote:
      'I want to move into cybersecurity in healthcare and need help with my job search.',
    region: Region.SHEFFIELD,
    openToRemote: false,
    availability: [AvailabilityOption.WEEKEND_EVENING],
    meetingCadence: MeetingCadence.WEEKLY,
    meetingStructure: MeetingStructure.OPEN,
    bio: 'Support analyst building security knowledge and looking for a local cybersecurity mentor.',
    disciplines: ['Cybersecurity'],
    skills: ['Job search'],
    industries: ['Healthcare & Life Sciences'],
    waitingStatus: WaitingStatus.WAITING,
    note: 'Negative matcher scenario. All APPROVED+ACCEPTING mentors are below 60. Noor is a perfect profile but PENDING, so must be excluded.',
  },
  {
    fullName: 'Maya Waiting',
    email: 'mentee.waiting@example.com',
    role: Role.MENTEE,
    linkedinURL: 'https://www.linkedin.com/in/demo-maya-waiting',
    currentJobTitle: 'Business Analyst',
    reasonsNote: 'I want support moving into product and project management.',
    region: Region.WEST_MIDLANDS,
    openToRemote: true,
    availability: [AvailabilityOption.WEEKDAY_AFTERNOON],
    meetingCadence: MeetingCadence.MONTHLY,
    meetingStructure: MeetingStructure.MIX,
    bio: 'Business analyst interested in product delivery and leadership.',
    disciplines: ['Product & Project Management', 'Leadership & Management'],
    skills: ['Career advice', 'Soft skills'],
    industries: ['Professional & Business Services'],
    waitingStatus: WaitingStatus.NOTIFIED,
    note: 'Second admin waiting-list state; already notified.',
  },
  {
    fullName: 'Alex Incomplete',
    email: 'mentee.incomplete@example.com',
    role: Role.MENTEE,
    linkedinURL: 'https://www.linkedin.com/in/demo-alex-incomplete',
    currentJobTitle: 'Support Worker',
    reasonsNote: 'I want to explore a move into tech.',
    region: Region.LONDON,
    openToRemote: true,
    availability: [],
    disciplines: [],
    skills: [],
    industries: [],
    note: 'Incomplete profile state; not match-ready because availability is empty.',
  },
] satisfies MenteeSeed[];

type ReferenceData = {
  disciplineIds: Map<DisciplineOption, string>;
  skillIds: Map<SkillOption, string>;
  industryIds: Map<IndustryOption, string>;
};

async function seedReferenceData(): Promise<ReferenceData> {
  const disciplineRows = await Promise.all(
    DISCIPLINE_OPTIONS.map((name) =>
      prisma.discipline.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const skillRows = await Promise.all(
    SKILL_OPTIONS.map((name) =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const industryRows = await Promise.all(
    INDUSTRY_OPTIONS.map((name) =>
      prisma.industry.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return {
    disciplineIds: new Map(
      disciplineRows.map(({ id, name }) => [name as DisciplineOption, id]),
    ),
    skillIds: new Map(
      skillRows.map(({ id, name }) => [name as SkillOption, id]),
    ),
    industryIds: new Map(
      industryRows.map(({ id, name }) => [name as IndustryOption, id]),
    ),
  };
}

function requireId<T extends string>(map: Map<T, string>, name: T): string {
  const id = map.get(name);
  if (!id) throw new Error(`Missing seeded reference value: ${name}`);
  return id;
}

async function upsertUser(seed: UserSeed, passwordHashed: string) {
  const createData = {
    fullName: seed.fullName,
    role: seed.role,
    email: seed.email,
    passwordHashed,
    linkedinURL: seed.linkedinURL ?? null,
    scheduleURL: seed.scheduleURL ?? null,
    isActive: true,
    isEmailVerified: true,
  } satisfies Prisma.UserUncheckedCreateInput;

  const updateData = {
    fullName: seed.fullName,
    role: seed.role,
    passwordHashed,
    linkedinURL: seed.linkedinURL ?? null,
    scheduleURL: seed.scheduleURL ?? null,
    isActive: true,
    deactivatedAt: null,
    isEmailVerified: true,
    emailVerificationTokenHash: null,
    emailVerificationExpiresAt: null,
  } satisfies Prisma.UserUncheckedUpdateInput;

  return prisma.user.upsert({
    where: { email: seed.email },
    create: createData,
    update: updateData,
  });
}

async function replaceMentorTaxonomy(
  mentorId: string,
  seed: Pick<MentorSeed, 'disciplines' | 'skills' | 'industries'>,
  referenceData: ReferenceData,
) {
  await prisma.$transaction([
    prisma.mentorDisciplines.deleteMany({ where: { mentorId } }),
    prisma.mentorSkills.deleteMany({ where: { mentorId } }),
    prisma.mentorDomainIndustries.deleteMany({ where: { mentorId } }),
  ]);

  if (seed.disciplines.length > 0) {
    await prisma.mentorDisciplines.createMany({
      data: seed.disciplines.map((name) => ({
        mentorId,
        disciplineId: requireId(referenceData.disciplineIds, name),
      })),
    });
  }

  if (seed.skills.length > 0) {
    await prisma.mentorSkills.createMany({
      data: seed.skills.map((name) => ({
        mentorId,
        skillId: requireId(referenceData.skillIds, name),
      })),
    });
  }

  if (seed.industries.length > 0) {
    await prisma.mentorDomainIndustries.createMany({
      data: seed.industries.map((name) => ({
        mentorId,
        industryId: requireId(referenceData.industryIds, name),
      })),
    });
  }
}

async function replaceMenteeTaxonomy(
  menteeId: string,
  seed: Pick<MenteeSeed, 'disciplines' | 'skills' | 'industries'>,
  referenceData: ReferenceData,
) {
  await prisma.$transaction([
    prisma.menteeGoalDisciplines.deleteMany({ where: { menteeId } }),
    prisma.menteeWantedSkills.deleteMany({ where: { menteeId } }),
    prisma.menteeTargetedIndustries.deleteMany({ where: { menteeId } }),
  ]);

  if (seed.disciplines.length > 0) {
    await prisma.menteeGoalDisciplines.createMany({
      data: seed.disciplines.map((name) => ({
        menteeId,
        disciplineId: requireId(referenceData.disciplineIds, name),
      })),
    });
  }

  if (seed.skills.length > 0) {
    await prisma.menteeWantedSkills.createMany({
      data: seed.skills.map((name) => ({
        menteeId,
        skillId: requireId(referenceData.skillIds, name),
      })),
    });
  }

  if (seed.industries.length > 0) {
    await prisma.menteeTargetedIndustries.createMany({
      data: seed.industries.map((name) => ({
        menteeId,
        industryId: requireId(referenceData.industryIds, name),
      })),
    });
  }
}

async function seedMentor(
  seed: MentorSeed,
  passwordHashed: string,
  referenceData: ReferenceData,
): Promise<string> {
  const user = await upsertUser(seed, passwordHashed);

  const notifiedAdminAt =
    seed.approvalStatus === ApprovalStatus.PENDING ? new Date() : null;

  const createData = {
    userId: user.id,
    currentJobTitle: seed.currentJobTitle,
    capacity: seed.capacity,
    region: seed.region,
    openToRemote: seed.openToRemote,
    availability: seed.availability,
    meetingCadence: seed.meetingCadence,
    meetingStructure: seed.meetingStructure,
    bio: seed.bio,
    isAcceptingMentees: seed.isAcceptingMentees,
    approvalStatus: seed.approvalStatus,
    notifiedAdminAt,
  } satisfies Prisma.MentorProfileUncheckedCreateInput;

  const updateData = {
    currentJobTitle: seed.currentJobTitle,
    capacity: seed.capacity,
    region: seed.region,
    openToRemote: seed.openToRemote,
    availability: seed.availability,
    meetingCadence: seed.meetingCadence,
    meetingStructure: seed.meetingStructure,
    bio: seed.bio,
    isAcceptingMentees: seed.isAcceptingMentees,
    approvalStatus: seed.approvalStatus,
    notifiedAdminAt,
  } satisfies Prisma.MentorProfileUncheckedUpdateInput;

  const profile = await prisma.mentorProfile.upsert({
    where: { userId: user.id },
    create: createData,
    update: updateData,
  });

  await replaceMentorTaxonomy(profile.id, seed, referenceData);
  return profile.id;
}

async function seedMentee(
  seed: MenteeSeed,
  passwordHashed: string,
  referenceData: ReferenceData,
): Promise<string> {
  const user = await upsertUser(seed, passwordHashed);

  const createData = {
    userId: user.id,
    currentJobTitle: seed.currentJobTitle ?? null,
    reasonsNote: seed.reasonsNote ?? null,
    region: seed.region ?? null,
    openToRemote: seed.openToRemote,
    availability: seed.availability,
    meetingCadence: seed.meetingCadence ?? null,
    meetingStructure: seed.meetingStructure ?? null,
    bio: seed.bio ?? null,
  } satisfies Prisma.MenteeProfileUncheckedCreateInput;

  const updateData = {
    currentJobTitle: seed.currentJobTitle ?? null,
    reasonsNote: seed.reasonsNote ?? null,
    region: seed.region ?? null,
    openToRemote: seed.openToRemote,
    availability: seed.availability,
    meetingCadence: seed.meetingCadence ?? null,
    meetingStructure: seed.meetingStructure ?? null,
    bio: seed.bio ?? null,
  } satisfies Prisma.MenteeProfileUncheckedUpdateInput;

  const profile = await prisma.menteeProfile.upsert({
    where: { userId: user.id },
    create: createData,
    update: updateData,
  });

  await replaceMenteeTaxonomy(profile.id, seed, referenceData);

  await prisma.menteeWaitingList.deleteMany({
    where: { menteeId: profile.id },
  });

  if (seed.waitingStatus) {
    const waitingListData = {
      menteeId: profile.id,
      status: seed.waitingStatus,
      notifiedAdminAt:
        seed.waitingStatus === WaitingStatus.NOTIFIED ? new Date() : null,
    } satisfies Prisma.MenteeWaitingListUncheckedCreateInput;

    await prisma.menteeWaitingList.create({
      data: waitingListData,
    });
  }

  return profile.id;
}

async function main() {
  console.log('Seeding manual demo dataset...');

  const passwordHashed = await hashPassword(DEMO_PASSWORD);
  const referenceData = await seedReferenceData();

  const admin = await upsertUser(ADMIN, passwordHashed);

  const seededMentorIds: string[] = await Promise.all(
    MENTORS.map((mentorSeed) =>
      seedMentor(mentorSeed, passwordHashed, referenceData),
    ),
  );

  const seededMenteeIds: string[] = await Promise.all(
    MENTEES.map((menteeSeed) =>
      seedMentee(menteeSeed, passwordHashed, referenceData),
    ),
  );

  // Keep this demo deterministic. Because this changes the globally active
  // matcher config, the ALLOW_DEMO_SEED guard above is intentionally required.
  await prisma.matchingConfig.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const matchingConfigCreate = {
    id: DEMO_MATCHING_CONFIG_ID,
    weights: DEMO_WEIGHTS,
    minScoreThreshold: DEMO_THRESHOLD,
    isActive: true,
    updatedBy: admin.id,
  } satisfies Prisma.MatchingConfigUncheckedCreateInput;

  const matchingConfigUpdate = {
    weights: DEMO_WEIGHTS,
    minScoreThreshold: DEMO_THRESHOLD,
    isActive: true,
    updatedBy: admin.id,
  } satisfies Prisma.MatchingConfigUncheckedUpdateInput;

  await prisma.matchingConfig.upsert({
    where: { id: DEMO_MATCHING_CONFIG_ID },
    create: matchingConfigCreate,
    update: matchingConfigUpdate,
  });

  // Remove previous match history for only these seeded profiles, so repeated
  // demo runs do not change candidate exclusion/capacity behaviour.
  await prisma.matches.deleteMany({
    where: {
      OR: [
        {
          mentorId: {
            in: seededMentorIds,
          },
        },
        {
          menteeId: {
            in: seededMenteeIds,
          },
        },
      ],
    },
  });

  console.log('\n Manual demo seed complete');
  console.log(`Shared password: ${DEMO_PASSWORD}`);
  console.log(`Matching threshold: ${DEMO_THRESHOLD}%`);

  console.table([
    {
      role: 'ADMIN',
      email: ADMIN.email,
      state: 'Admin/staff view',
    },
    ...MENTORS.map((mentor) => ({
      role: 'MENTOR',
      email: mentor.email,
      state: mentor.note,
    })),
    ...MENTEES.map((mentee) => ({
      role: 'MENTEE',
      email: mentee.email,
      state: mentee.note,
    })),
  ]);

  console.log('\nManual checks:');
  console.log(
    '1. Login as mentee.match@example.com: the matcher should return one or more approved mentors.',
  );
  console.log(
    '2. Login as mentee.nomatch@example.com BEFORE approving Noor: no mentor should be proposed because all eligible scores are below 60.',
  );
  console.log(
    '3. Login as admin.demo@example.com: Casey/Sam/Maya should populate waiting-list states, and Noor/Imani should be pending mentor approvals.',
  );
  console.log(
    '4. Approve mentor.pending.cyber@example.com, then retry Casey: Noor should become eligible and should strongly match Casey.',
  );
}

main()
  .catch((error) => {
    console.error('Manual demo seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
