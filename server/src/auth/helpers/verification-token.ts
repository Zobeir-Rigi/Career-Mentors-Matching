import { createHash, randomBytes } from 'node:crypto';

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

export interface VerificationTokenData {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export function hashVerificationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createVerificationToken(): VerificationTokenData {
  const token = randomBytes(VERIFICATION_TOKEN_BYTES).toString('hex');
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS);

  return {
    token,
    tokenHash: hashVerificationToken(token),
    expiresAt,
  };
}
