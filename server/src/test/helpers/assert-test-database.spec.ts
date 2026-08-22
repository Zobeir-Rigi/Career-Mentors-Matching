import { assertTestDatabaseUrl } from './assert-test-database';

describe('assertTestDatabaseUrl', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('allows a test database when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test';

    const url =
      'postgresql://postgres:postgres@localhost:5435/mentor_matching_test';

    const result = assertTestDatabaseUrl(url);

    expect(result).toBe(url);
  });

  it('rejects a database that does not end with _test', () => {
    process.env.NODE_ENV = 'test';

    const url = 'postgresql://postgres:postgres@localhost:5435/mentor_matching';

    expect(() => assertTestDatabaseUrl(url)).toThrow(
      'Test database names must end with "_test".',
    );
  });

  it('rejects access when NODE_ENV is not test', () => {
    process.env.NODE_ENV = 'development';

    const url =
      'postgresql://postgres:postgres@localhost:5435/mentor_matching_test';

    expect(() => assertTestDatabaseUrl(url)).toThrow(
      'Refusing test database access because NODE_ENV is "development".',
    );
  });

  it('rejects access when DATABASE_URL is missing', () => {
    process.env.NODE_ENV = 'test';

    expect(() => assertTestDatabaseUrl(undefined)).toThrow(
      'DATABASE_URL is required for database tests.',
    );
  });
});
