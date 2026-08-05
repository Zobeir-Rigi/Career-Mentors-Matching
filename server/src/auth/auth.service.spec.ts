import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PublicSignupRole, SignupDto } from './dto/signup.dto';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mailServiceMock = {
    sendVerificationEmail: jest.fn(),
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
      new Error('Resend unavailable'),
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
});
