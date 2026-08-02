import type { Role } from '../../generated/prisma/client';

export interface SignedUpUserResponse {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface SignupResponse {
  message: string;
  user: SignedUpUserResponse;
}
