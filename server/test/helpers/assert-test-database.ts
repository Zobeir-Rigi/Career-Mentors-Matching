export function assertTestDatabaseUrl(
  connectionString: string | undefined,
): string {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Refusing test database access because NODE_ENV is "${process.env.NODE_ENV}".`,
    );
  }

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for database tests.');
  }

  const databaseUrl = new URL(connectionString);

  const databaseName = databaseUrl.pathname.replace(/^\//, '');

  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `Refusing test database access to database "${databaseName}". ` +
        'Test database names must end with "_test".',
    );
  }

  return connectionString;
}
