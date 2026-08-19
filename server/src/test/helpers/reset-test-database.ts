import type { PrismaClient } from '@/generated/prisma/client';
import { assertTestDatabaseUrl } from './assert-test-database';

export async function resetTestDatabase(prisma: PrismaClient): Promise<void> {
  assertTestDatabaseUrl(process.env.DATABASE_URL);

  await prisma.$transaction(async (tx) => {
    await tx.matches.deleteMany();

    await tx.user.deleteMany();

    await tx.skill.deleteMany();
    await tx.discipline.deleteMany();
    await tx.industry.deleteMany();

    await tx.healthCheck.deleteMany();
  });
}
