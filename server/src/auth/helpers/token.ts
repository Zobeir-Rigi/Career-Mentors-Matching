import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 32;

export interface TokenData {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createToken(lifeTimeMs: number): TokenData {
  const token = randomBytes(TOKEN_BYTES).toString('hex');
  const expiresAt = new Date(Date.now() + lifeTimeMs);

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt,
  };
}
