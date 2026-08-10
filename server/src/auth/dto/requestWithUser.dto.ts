import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: 'MENTEE' | 'MENTOR' | 'ADMIN';
    isEmailVerified: boolean;
  };
}
