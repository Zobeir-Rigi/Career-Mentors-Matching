import { MatchStatus } from '../../generated/prisma/enums';

export const CAPACITY_RELEVANT_STATUSES: MatchStatus[] = [
  MatchStatus.CHEMISTRY_PENDING,
  MatchStatus.CHEMISTRY_CONFIRMED,
  MatchStatus.MATCH_PENDING,
  MatchStatus.ACTIVE,
] as const;
