import {
  Controller,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { LoginDto } from './dto/login.dto';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from './auth-cookie';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a mentee or mentor account',
  })
  @ApiCreatedResponse({
    description:
      'Account created successfully. Email verification is required.',
  })
  @ApiBadRequestResponse({
    description: 'Signup input failed validation.',
  })
  @ApiConflictResponse({
    description: 'Email already registered.',
  })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify a user email address',
  })
  @ApiOkResponse({
    description: 'Email address verified successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Verification link is invalid, expired, or already used.',
  })
  verifyEmail(@Query() query: VerifyEmailDto) {
    return this.authService.verifyEmail(query.token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend an email-verification link',
  })
  @ApiOkResponse({
    description:
      'Returns a generic response whether or not an eligible account exists.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid email format.',
  })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // Restricts too many attempts - Brute force
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  @ApiOperation({
    summary: 'Log in to an existing account',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiOkResponse({
    description:
      'Credentials accepted. Sets an authentication cookie and returns the user profile.',
    schema: {
      example: {
        user: {
          id: '543e8400-e29b-41d4-a716-446655440000',
          fullName: 'Jane Doe',
          email: 'test@example.com',
          role: 'MENTEE',
          isEmailVerified: true,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many login attempts. Try again later.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    response.cookie(
      AUTH_COOKIE_NAME,
      result.accessToken,
      getAuthCookieOptions(),
    );
    return {
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out the current user',
  })
  @ApiOkResponse({
    description: 'Authentication cookie cleared successfully.',
  })
  logout(@Res({ passthrough: true }) response: Response) {
    const cookieOptions = getAuthCookieOptions();

    response.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    return {
      message: 'Logged out successfully',
    };
  }
}
