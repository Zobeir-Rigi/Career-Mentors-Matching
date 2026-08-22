import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { assertTestDatabaseUrl } from './assert-test-database';

export function createTestPrismaClient(): PrismaClient {
  const connectionString = assertTestDatabaseUrl(process.env.DATABASE_URL);

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
  });
}
