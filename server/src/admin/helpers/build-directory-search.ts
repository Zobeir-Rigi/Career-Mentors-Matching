type DisciplineRelation = 'mentorDisciplines' | 'goalDisciplines';

export function buildDirectorySearch(
  search: string | undefined,
  disciplineRelation: DisciplineRelation,
) {
  const searchTerm = search?.trim();

  if (!searchTerm) {
    return {};
  }

  return {
    OR: [
      {
        user: {
          fullName: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      },
      {
        user: {
          email: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      },
      {
        [disciplineRelation]: {
          some: {
            discipline: {
              name: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          },
        },
      },
    ],
  };
}
