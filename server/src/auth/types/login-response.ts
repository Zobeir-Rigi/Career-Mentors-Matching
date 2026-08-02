import type { Role } from '../../generated/prisma/client';

export interface LoginUserResponse {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: LoginUserResponse;
}
