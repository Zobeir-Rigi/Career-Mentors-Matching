import * as argon2 from 'argon2';

// Hash passwords at signup
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

// Verify passwords at login
export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return argon2.verify(passwordHash, password);
}
