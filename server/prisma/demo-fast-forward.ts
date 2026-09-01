import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { MatchStatus } from '../src/generated/prisma/enums';

const connectionString =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DIRECT_DATABASE_URL or DATABASE_URL is required to fast-forward demo data.',
  );
}

if (process.env.ALLOW_DEMO_MUTATIONS !== 'true') {
  throw new Error(
    'Refusing to fast-forward demo data. Set ALLOW_DEMO_MUTATIONS=true explicitly.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type FastForwardMode = 'check-in' | 'check-in-expiry';

function isFastForwardMode(
  value: string | undefined,
): value is FastForwardMode {
  return value === 'check-in' || value === 'check-in-expiry';
}

async function findSingleDemoMatch(
  menteeFullName: string,
  status: MatchStatus,
) {
  const matches = await prisma.matches.findMany({
    where: {
      status,
      menteeProfile: {
        user: {
          fullName: menteeFullName,
        },
      },
    },
    select: {
      id: true,
      status: true,
      scheduledCheckIn: true,
      checkInExpiresAt: true,
      checkInMenteeAgreed: true,
      checkInMentorAgreed: true,
      menteeProfile: {
        select: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
      mentorProfile: {
        select: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (matches.length === 0) {
    throw new Error(
      `No ${status} match found for demo mentee "${menteeFullName}".`,
    );
  }

  if (matches.length > 1) {
    console.table(
      matches.map((match) => ({
        id: match.id,
        status: match.status,
        mentee: match.menteeProfile.user.fullName,
        mentor: match.mentorProfile.user.fullName,
      })),
    );

    throw new Error(
      `More than one ${status} match found for "${menteeFullName}". Refusing to choose automatically.`,
    );
  }

  return matches[0];
}

async function main() {
  const mode = process.argv[2];

  if (!isFastForwardMode(mode)) {
    throw new Error('Choose a mode: "check-in" or "check-in-expiry".');
  }

  const menteeFullName = process.env.DEMO_MENTEE_NAME ?? 'Sam Match';

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  if (mode === 'check-in') {
    const match = await findSingleDemoMatch(
      menteeFullName,
      MatchStatus.CHEMISTRY_CONFIRMED,
    );

    await prisma.matches.update({
      where: {
        id: match.id,
      },
      data: {
        scheduledCheckIn: oneMinuteAgo,
      },
    });

    console.log('\nDemo check-in fast-forwarded.');

    console.table([
      {
        matchId: match.id,
        mentee: match.menteeProfile.user.fullName,
        mentor: match.mentorProfile.user.fullName,
        status: match.status,
        scheduledCheckIn: oneMinuteAgo.toISOString(),
      },
    ]);

    console.log(
      '\nThe application scheduler should move this match to MATCH_PENDING on its next run.',
    );

    return;
  }

  const match = await findSingleDemoMatch(
    menteeFullName,
    MatchStatus.MATCH_PENDING,
  );

  if (
    match.checkInMenteeAgreed !== null &&
    match.checkInMentorAgreed !== null
  ) {
    throw new Error(
      'Both people have already responded to this check-in. Refusing to expire it.',
    );
  }

  await prisma.matches.update({
    where: {
      id: match.id,
    },
    data: {
      checkInExpiresAt: oneMinuteAgo,
    },
  });

  console.log('\nDemo check-in expiry fast-forwarded.');

  console.table([
    {
      matchId: match.id,
      mentee: match.menteeProfile.user.fullName,
      mentor: match.mentorProfile.user.fullName,
      status: match.status,
      checkInExpiresAt: oneMinuteAgo.toISOString(),
    },
  ]);

  console.log(
    '\nThe application scheduler should decline the unanswered match on its next run.',
  );
}

main()
  .catch((error) => {
    console.error('Demo fast-forward failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
