import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PublicSignupRole, SignupDto } from './dto/signup.dto';

jest.mock('./helpers/password-reset-token', () => ({
  createPasswordResetToken: jest.fn(() => ({
    token: 'reset-token',
    tokenHash: 'hashed-reset-token',
    expiresAt: new Date('2026-08-17T15:00:00.000Z'),
  })),
}));

jest.mock('./helpers/hash-password', () => ({
  hashPassword: jest.fn(() => Promise.resolve('hashed-new-password')),
  verifyPassword: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mailServiceMock = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should reject signup when the email is already registered', async () => {
    const dto: SignupDto = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: PublicSignupRole.MENTEE,
    };

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing-user-id',
    });
    const signupPromise = service.signup(dto);

    await expect(signupPromise).rejects.toBeInstanceOf(ConflictException);
    await expect(signupPromise).rejects.toMatchObject({
      message: 'Email already registered',
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'test@example.com',
      },
      select: {
        id: true,
      },
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(mailServiceMock.sendVerificationEmail).not.toHaveBeenCalled();
  });
  it('should create the account when sending the verification email fails', async () => {
    const dto: SignupDto = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: PublicSignupRole.MENTEE,
    };

    const createdUser = {
      id: 'user-id',
      fullName: 'Test User',
      email: 'test@example.com',
      role: PublicSignupRole.MENTEE,
      isEmailVerified: false,
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockResolvedValue(createdUser);

    mailServiceMock.sendVerificationEmail.mockRejectedValue(
      new Error('Email service unavailable'),
    );

    const result = await service.signup(dto);

    expect(result).toEqual({
      message:
        'Account created, but the verification email could not be sent. Please request a new verification email.',
      verificationEmailSent: false,
      user: createdUser,
    });

    expect(mailServiceMock.sendVerificationEmail).toHaveBeenCalled();
  });

  it('should create and store a password reset token for an existing user', async () => {
    const user = {
      id: 'user-id',
      email: 'jane@example.com',
      fullName: 'Jane Doe',
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(user);

    mailServiceMock.sendPasswordResetEmail.mockResolvedValue(undefined);

    const result = await service.forgotPassword('jane@example.com');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'jane@example.com',
      },
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: {
        id: 'user-id',
      },
      data: {
        passwordResetTokenHash: 'hashed-reset-token',
        passwordResetExpiresAt: new Date('2026-08-17T15:00:00.000Z'),
      },
    });

    expect(mailServiceMock.sendPasswordResetEmail).toHaveBeenCalledWith({
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      token: 'reset-token',
    });

    expect(result).toEqual({
      message:
        'If an account exists for that email, a password reset link has been sent.',
    });
  });

  it('should return a generic response when the email does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await service.forgotPassword('missing@example.com');

    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(mailServiceMock.sendPasswordResetEmail).not.toHaveBeenCalled();

    expect(result).toEqual({
      message:
        'If an account exists for that email, a password reset link has been sent.',
    });
  });

  it('should still return a generic response when reset email sending fails', async () => {
    const user = {
      id: 'user-id',
      email: 'jane@example.com',
      fullName: 'Jane Doe',
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(user);

    mailServiceMock.sendPasswordResetEmail.mockRejectedValue(
      new Error('Email service unavailable'),
    );

    const result = await service.forgotPassword('jane@example.com');

    expect(result).toEqual({
      message:
        'If an account exists for that email, a password reset link has been sent.',
    });
  });

  it('should reset the password when the token is valid', async () => {
    const user = {
      id: 'user-id',
      passwordResetTokenHash: 'hashed-reset-token',
      passwordResetExpiresAt: new Date(Date.now() + 60_000),
    };

    prismaMock.user.findFirst.mockResolvedValue(user);

    prismaMock.user.update.mockResolvedValue({
      ...user,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });

    const result = await service.resetPassword(
      'valid-token',
      'NewPassword123!',
    );

    expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: {
        id: 'user-id',
      },
      data: {
        passwordHashed: 'hashed-new-password',
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    expect(result).toEqual({
      message: 'Password reset successfully.',
    });
  });

  it('should reject an invalid or expired reset token', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    await expect(
      service.resetPassword('invalid-token', 'NewPassword123!'),
    ).rejects.toThrow('Password reset link is invalid or expired.');

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});
