import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface SendAuthEmailParams {
  email: string;
  fullName: string;
  token: string;
}

interface SendChemistryProposalEmailParams {
  email: string;
  mentorFullName: string;
  menteeFullName: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly ses: SESClient;
  private readonly emailFrom: string;
  private readonly frontendUrl: string;
  private readonly emailProvider: string;

  constructor(private readonly configService: ConfigService) {
    this.emailFrom = this.configService.getOrThrow<string>('EMAIL_FROM') ?? '';

    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    this.emailProvider =
      this.configService.getOrThrow<string>('EMAIL_PROVIDER');

    this.ses = new SESClient({ region: 'eu-west-1' });
  }

  async sendVerificationEmail({
    email,
    fullName,
    token,
  }: SendAuthEmailParams): Promise<void> {
    const verificationUrl = new URL('/verify-email', this.frontendUrl);

    verificationUrl.searchParams.set('token', token);

    const firstName = fullName.trim().split(/\s+/)[0];

    const html = `
      <h1>Verify your email</h1>
      <p>Hi ${firstName},</p>
      <p>Please verify your email address to continue using the CYF Mentorship platform.</p>
        <p>
          <a href="${verificationUrl.toString()}">
            Verify email
          </a>
        </p>
        <p>This verification link expires in 24 hours.</p>
      `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Verification email for ${email}: ${verificationUrl.toString()}`,
      );
      return;
    }

    const command = new SendEmailCommand({
      Source: this.emailFrom,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: { Data: 'Verify your CYF Mentorship email', Charset: 'UTF-8' },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      this.logger.error('Failed to send verification email: ', error);

      throw new InternalServerErrorException(
        'Unable to send verification email',
      );
    }
  }

  async sendPasswordResetEmail({
    email,
    fullName,
    token,
  }: SendAuthEmailParams): Promise<void> {
    const resetUrl = new URL('/reset-password', this.frontendUrl);
    resetUrl.searchParams.set('token', token);

    const firstName = fullName.trim().split(/\s+/)[0];

    const html = `
      <h1>Reset your password</h1>
      <p>Hi ${firstName},</p>
      <p>Please click the link below to reset your password for the CYF Mentorship platform.</p>
        <p>
          <a href="${resetUrl.toString()}">
            Reset password
          </a>
        </p>
        <p>This reset link expires in 1 hour.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Password reset email for ${email}: ${resetUrl.toString()}`,
      );
      return;
    }

    const command = new SendEmailCommand({
      Source: this.emailFrom,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Data: 'Reset your CYF Mentorship password',
          Charset: 'UTF-8',
        },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      this.logger.error('Failed to send password reset email: ', error);

      throw new InternalServerErrorException(
        'Unable to send password reset email',
      );
    }
  }

  async sendChemistryProposalEmail({
    email,
    mentorFullName,
    menteeFullName,
  }: SendChemistryProposalEmailParams): Promise<void> {
    const dashboardUrl = new URL('/mentor/dashboard', this.frontendUrl);

    const mentorFirstName = mentorFullName.trim().split(/\s+/)[0];

    const html = `
    <h1>New chemistry session proposal</h1>
    <p>Hi ${mentorFirstName},</p>
    <p>${menteeFullName} would like to have a chemistry session with you.</p>
    <p>
      Please log in to your mentor dashboard to review the proposal and accept or decline it.
    </p>
    <p>
      <a href="${dashboardUrl.toString()}">
        Review chemistry proposal
      </a>
    </p>
  `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Chemistry proposal email for ${email}: ${dashboardUrl.toString()}`,
      );
      return;
    }

    const command = new SendEmailCommand({
      Source: this.emailFrom,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'New chemistry session proposal',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      this.logger.error('Failed to send chemistry proposal email: ', error);

      throw new InternalServerErrorException(
        'Unable to send chemistry proposal email',
      );
    }
  }
}
