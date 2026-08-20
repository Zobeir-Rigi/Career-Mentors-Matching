import { Role } from '@/generated/prisma/enums';
import { AdminGuard } from './admin.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  function createContext(role: Role): ExecutionContext {
    const request = {
      user: {
        userId: 'user-id',
        email: 'user@example.com',
        role,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }

  it('allows access for an admin user', () => {
    const context = createContext(Role.ADMIN);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects access for a mentor user', () => {
    const context = createContext(Role.MENTOR);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects access for a mentee user', () => {
    const context = createContext(Role.MENTEE);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
