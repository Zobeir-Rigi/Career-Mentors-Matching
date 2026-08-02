import { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'accessToken';

const DEFAULT_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

export function getAuthCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredMaxAge = Number(process.env.AUTH_COOKIE_MAX_AGE_MS ?? NaN);

  const maxAge =
    Number.isFinite(configuredMaxAge) && configuredMaxAge > 0
      ? configuredMaxAge
      : DEFAULT_COOKIE_MAX_AGE;
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge,
    path: '/',
  };
}
