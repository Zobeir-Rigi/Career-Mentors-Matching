import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
interface SendVerificationEmailParams {
  email: string;
  fullName: string;
  token: string;
}

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly emailFrom: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.emailFrom = this.configService.getOrThrow<string>('EMAIL_FROM');

    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail({
    email,
    fullName,
    token,
  }: SendVerificationEmailParams): Promise<void> {
    const verificationUrl = new URL('/verify-email', this.frontendUrl);
    verificationUrl.searchParams.set('token', token);

    const { error } = await this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Verify your CYF Mentorship email',
      html: `
      <h1>Verify your email</h1>
      <p>Hi ${fullName},</p>
      <p>Please verify your email address to continue using the CYF Mentorship platform.</p>
        <p>
          <a href="${verificationUrl.toString()}">
            Verify email
          </a>
        </p>
        <p>This verification link expires in 24 hours.</p>
      `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send verification email',
      );
    }
  }
}
