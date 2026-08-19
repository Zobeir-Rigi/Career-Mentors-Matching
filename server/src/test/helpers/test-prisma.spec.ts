import { createTestPrismaClient } from './test-prisma';

describe('createTestPrismaClient', () => {
  const prisma = createTestPrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('loads the test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.DATABASE_URL).toContain('mentor_matching_test');
  });

  it('connect to the test database and can query Prisma models', async () => {
    const userCount = await prisma.user.count();

    expect(typeof userCount).toBe('number');
  });
});
