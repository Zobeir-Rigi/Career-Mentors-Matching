import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  createVerificationToken,
  hashVerificationToken,
} from './helpers/verification-token';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from './helpers/hash-password';
import { Role } from '../generated/prisma/client';
import { MailService } from '../mail/mail.service';
import { LoginResponse } from './types/login-response';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Inject one instance of prisma client rather than creating a new client
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email.trim().toLowerCase();
    const fullName = dto.fullName.trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // hash the user password before saving to database
    const passwordHashed = await hashPassword(dto.password);
    // create token to be sent to email for verification
    const verificationToken = createVerificationToken();

    const user = await this.prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          fullName,
          email,
          passwordHashed,
          role: dto.role,
          emailVerificationTokenHash: verificationToken.tokenHash,
          emailVerificationExpiresAt: verificationToken.expiresAt,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isEmailVerified: true,
        },
      });

      if (createdUser.role === Role.MENTEE) {
        await transaction.menteeProfile.create({
          data: {
            userId: createdUser.id,
          },
        });
      }

      if (createdUser.role === Role.MENTOR) {
        await transaction.mentorProfile.create({
          data: {
            userId: createdUser.id,
          },
        });
      }
      return createdUser;
    });

    let verificationEmailSent = true;

    try {
      await this.mailService.sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        token: verificationToken.token,
      });
    } catch (error) {
      verificationEmailSent = false;

      this.logger.error(
        `Verification email could not be sent for user ${user.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
    return {
      message: verificationEmailSent
        ? 'Account created, Please verify your email.'
        : 'Account created, but the verification email could not be sent. Please request a new verification email.',
      verificationEmailSent,
      user,
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = hashVerificationToken(token);

    const user = await this.prisma.user.findUnique({
      where: {
        emailVerificationTokenHash: tokenHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isEmailVerified: true,
        emailVerificationExpiresAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Verification link is invalid or has expired',
      );
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email address is already verified');
    }

    if (
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'Verification link is invalid or has expired',
      );
    }

    const verifiedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isEmailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isEmailVerified: true,
      },
    });
    return {
      message: 'Email verified successfully',
      user: verifiedUser,
    };
  }

  async resendVerification(emailInput: string) {
    const email = emailInput.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        isEmailVerified: true,
      },
    });

    const genericResponse = {
      message:
        'If an unverified account exists for that email, a verification email has been sent.',
    };

    if (!user || user.isEmailVerified) {
      return genericResponse;
    }

    const verificationToken = createVerificationToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationTokenHash: verificationToken.tokenHash,
        emailVerificationExpiresAt: verificationToken.expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail({
      email: user.email,
      fullName: user.fullName,
      token: verificationToken.token,
    });

    return genericResponse;
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        passwordHashed: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await verifyPassword(
      dto.password,
      user.passwordHashed,
    );

    if (!passwordMatches || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in.',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}
