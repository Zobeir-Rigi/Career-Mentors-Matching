import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { Role } from '@/generated/prisma/client';

const connectionString =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DIRECT_DATABASE_URL or DATABASE_URL is required to update demo emails.',
  );
}

if (process.env.ALLOW_DEMO_MUTATIONS !== 'true') {
  throw new Error(
    'Refusing to update demo emails. Set ALLOW_DEMO_MUTATIONS=true explicitly.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_LINKENDIN_PREFIX = 'https://www.linkedin.com/in/demo-';

function splitEmail(email: string) {
  const atIndex = email.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === email.length - 1) {
    throw new Error(`Invalid DEMO_EMAIL_BASE: ${email}`);
  }

  return {
    localPart: email.slice(0, atIndex),
    domain: email.slice(atIndex + 1),
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  const baseEmail = process.env.DEMO_EMAIL_BASE;

  if (!baseEmail) {
    throw new Error(
      'DEMO_EMAIL_BASE is required. Example: your.name@gmail.com',
    );
  }

  console.log('Finding demo users...');

  const demoUsers = await prisma.user.findMany({
    where: {
      OR: [
        {
          linkedinURL: {
            startsWith: DEMO_LINKENDIN_PREFIX,
          },
        },
        { fullName: 'Demo Admin', role: Role.ADMIN },
      ],
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
    orderBy: {
      fullName: 'asc',
    },
  });

  if (demoUsers.length === 0) {
    throw new Error(
      'No demo users found. Run the manual demo seed before setting demo emails.',
    );
  }

  const { localPart, domain } = splitEmail(baseEmail);

  const assignments = demoUsers.map((user) => {
    const role = user.role.toLowerCase();
    const name = slugify(user.fullName);

    return {
      ...user,
      targetEmail: `${localPart}+${role}-${name}@${domain}`,
    };
  });

  const targetEmails = assignments.map((assignment) => assignment.targetEmail);

  if (new Set(targetEmails).size !== targetEmails.length) {
    throw new Error('Generated demo email aliases are not unique.');
  }

  const existingUsersWithTargetEmails = await prisma.user.findMany({
    where: {
      email: {
        in: targetEmails,
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });

  const demoUserIds = new Set(demoUsers.map((user) => user.id));

  const collisions = existingUsersWithTargetEmails.filter(
    (user) => !demoUserIds.has(user.id),
  );

  if (collisions.length > 0) {
    console.table(collisions);
    throw new Error(
      'One or more generated aliases already belong to non-demo users.',
    );
  }

  console.log('\nDemo email changes:');

  console.table(
    assignments.map((assignment) => ({
      role: assignment.role,
      name: assignment.fullName,
      currentEmail: assignment.email,
      targetEmail: assignment.targetEmail,
    })),
  );

  await prisma.$transaction(async (tx) => {
    for (const assignment of assignments) {
      await tx.user.update({
        where: {
          id: assignment.id,
        },
        data: {
          email: assignment.targetEmail,
          isEmailVerified: true,
          emailVerificationTokenHash: null,
          emailVerificationExpiresAt: null,
        },
      });
    }
  });

  console.log(
    `\nDemo email update complete. Updated ${assignments.length} users.`,
  );

  const activeAdmins = await prisma.user.findMany({
    where: {
      role: Role.ADMIN,
      isActive: true,
    },
    select: {
      fullName: true,
      email: true,
    },
  });

  console.log('\nActive admins that can receive notifications:');
  console.table(activeAdmins);
}

main()
  .catch((error) => {
    console.error('Demo email update failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
