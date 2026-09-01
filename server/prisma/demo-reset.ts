import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { Role } from '@/generated/prisma/client';

const connectionString =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DIRECT_DATABASE_URL or DATABASE_URL is required to reset demo data.',
  );
}

if (process.env.ALLOW_DEMO_MUTATIONS !== 'true') {
  throw new Error(
    'Refusing to reset demo data. Set ALLOW_DEMO_MUTATIONS=true explicitly.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_LINKEDIN_PREFIX = 'https://www.linkedin.com/in/demo-';
const DEMO_MATCHING_CONFIG_ID = '00000000-0000-4000-8000-000000000101';

async function main() {
  console.log('Finding demo data...');

  const demoUsers = await prisma.user.findMany({
    where: {
      OR: [
        {
          linkedinURL: {
            startsWith: DEMO_LINKEDIN_PREFIX,
          },
        },
        {
          fullName: 'Demo Admin',
          role: Role.ADMIN,
        },
      ],
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      mentorProfile: {
        select: {
          id: true,
        },
      },
      menteeProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (demoUsers.length === 0) {
    console.log('No demo users found. Nothing to reest.');
    return;
  }

  console.table(
    demoUsers.map((user) => ({
      role: user.role,
      name: user.fullName,
      email: user.email,
    })),
  );

  const demoUserIds = demoUsers.map((user) => user.id);

  const demoMentorIds = demoUsers
    .map((user) => user.mentorProfile?.id)
    .filter((id): id is string => Boolean(id));

  const demoMenteeIds = demoUsers
    .map((user) => user.menteeProfile?.id)
    .filter((id): id is string => Boolean(id));

  await prisma.$transaction(async (tx) => {
    await tx.matches.deleteMany({
      where: {
        OR: [
          {
            mentorId: {
              in: demoMentorIds,
            },
          },
          {
            menteeId: {
              in: demoMenteeIds,
            },
          },
        ],
      },
    });

    await tx.menteeWaitingList.deleteMany({
      where: {
        menteeId: {
          in: demoMenteeIds,
        },
      },
    });

    await tx.matchingConfig.deleteMany({
      where: {
        id: DEMO_MATCHING_CONFIG_ID,
      },
    });

    await tx.mentorProfile.deleteMany({
      where: {
        id: {
          in: demoMentorIds,
        },
      },
    });

    await tx.menteeProfile.deleteMany({
      where: {
        id: {
          in: demoMenteeIds,
        },
      },
    });

    await tx.user.deleteMany({
      where: {
        id: {
          in: demoUserIds,
        },
      },
    });
  });

  console.log(`Demo reset complete. Removed ${demoUsers.length} demo users.`);
}

main()
  .catch((error) => {
    console.error('Demo reset failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
