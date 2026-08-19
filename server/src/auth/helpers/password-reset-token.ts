import { createToken, type TokenData } from './token';

const PASSWORD_RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export function createPasswordResetToken(): TokenData {
  return createToken(PASSWORD_RESET_TOKEN_LIFETIME_MS);
}
