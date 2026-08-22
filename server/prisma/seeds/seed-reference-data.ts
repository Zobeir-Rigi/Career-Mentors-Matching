import type { PrismaClient } from '@/generated/prisma/client';
import {
  DISCIPLINE_OPTIONS,
  INDUSTRY_OPTIONS,
  SKILL_OPTIONS,
} from './reference-data';

export async function upsertFrontendReferenceData(prisma: PrismaClient) {
  const disciplines = await Promise.all(
    DISCIPLINE_OPTIONS.map((name) =>
      prisma.discipline.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const skills = await Promise.all(
    SKILL_OPTIONS.map((name) =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const industries = await Promise.all(
    INDUSTRY_OPTIONS.map((name) =>
      prisma.industry.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return {
    disciplineIds: new Map(disciplines.map(({ id, name }) => [name, id])),
    skillIds: new Map(skills.map(({ id, name }) => [name, id])),
    industryIds: new Map(industries.map(({ id, name }) => [name, id])),
  };
}

export function getRequiredId(map: Map<string, string>, name: string): string {
  const id = map.get(name);

  if (!id) {
    throw new Error(`Seed reference data missing for: ${name}`);
  }

  return id;
}
