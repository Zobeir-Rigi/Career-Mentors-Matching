import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
interface SendVerificationEmailParams {
  email: string;
  fullName: string;
  token: string;
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
  }: SendVerificationEmailParams): Promise<void> {
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
}
