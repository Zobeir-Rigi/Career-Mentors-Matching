import { createToken, type TokenData } from './token';

const VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

export function createVerificationToken(): TokenData {
  return createToken(VERIFICATION_TOKEN_LIFETIME_MS);
}
