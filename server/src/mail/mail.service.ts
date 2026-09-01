import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ApprovalStatus } from '@/generated/prisma/enums';

interface SendAuthEmailParams {
  email: string;
  fullName: string;
  token: string;
}

interface SendMentorProfileReceivedParams {
  email: string;
  fullName: string;
}

interface SendMentorApprovalDecisionEmailParams {
  email: string;
  fullName: string;
  approvalStatus: Extract<ApprovalStatus, 'ACCEPTED' | 'DECLINED'>;
}

interface SendChemistryProposalEmailParams {
  email: string;
  mentorFullName: string;
  menteeFullName: string;
}

interface SendChemistryAcceptedEmailParams {
  email: string;
  menteeFullName: string;
  mentorFullName: string;
}

interface SendMentorshipCheckInEmailParams {
  email: string;
  fullName: string;
  counterpartFullName: string;
  recipientRole: 'mentor' | 'mentee';
}

interface SendMatchExpiredEmailParams {
  email: string;
  fullName: string;
  counterpartFullName: string;
  recipientRole: 'mentor' | 'mentee';
}

interface sendAdminMentorReadyForReviewEmailParams {
  email: string;
  adminFullName: string;
  mentorFullName: string;
  mentorEmail: string;
}

interface SendMenteeWaitingListAdminEmailParams {
  email: string;
  adminFullName: string;
  menteeFullName: string;
  menteeEmail: string;
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

    const recipientFullName = fullName.trim();

    const html = `
      <h1>Verify your email</h1>
      <p>Hi ${recipientFullName},</p>
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
        Subject: {
          Data: 'Verify your CYF Mentorship email',
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

    const recipientFullName = fullName.trim();

    const html = `
      <h1>Reset your password</h1>
      <p>Hi ${recipientFullName},</p>
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
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Reset your CYF Mentorship password',
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
      this.logger.error('Failed to send password reset email: ', error);

      throw new InternalServerErrorException(
        'Unable to send password reset email',
      );
    }
  }

  async sendMentorProfileReceivedEmail({
    email,
    fullName,
  }: SendMentorProfileReceivedParams): Promise<void> {
    const dashboardUrl = new URL('/mentor/dashboard', this.frontendUrl);

    const fullNameForEmail = fullName.trim();

    const html = `
      <h1>Your mentor profile has been received</h1>
      <p>Hi ${fullNameForEmail}</p>
      <p>
        Thank you for completing your mentor profile.
        We've received it and it is now waiting for CYF approval.
      </p>
      <p>
        We'll let you know when your profile has been reviewed.
      </p>
      <p>
        <a href="${dashboardUrl.toString()}">
          View your mentor dashboard
        </a>
      </p>
    `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Mentor profile submitted email for ${email}: ${dashboardUrl.toString()}`,
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
          Data: 'Your CYF mentor profile has been received',
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
      this.logger.error(
        'Failed to send mentor profile submitted email: ',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to send mentor profile submitted email',
      );
    }
  }

  async sendMentorApprovalDecisionEmail({
    email,
    fullName,
    approvalStatus,
  }: SendMentorApprovalDecisionEmailParams) {
    const dashboardUrl = new URL('/mentor/dashboard', this.frontendUrl);

    const recipientFullName = fullName.trim();

    const accepted = approvalStatus === ApprovalStatus.ACCEPTED;

    const subject = accepted
      ? 'Your CYF mentor profile has been approved'
      : 'Update on your CYF mentor profile';

    const html = accepted
      ? `
      <h1>Your mentor profile has been approved</h1>
      <p>Hi ${recipientFullName},</p>
      <p>
        Your CYF mentor profile has been reviewed and approved.
      </p>
      <p>
        You can now manage your mentoring availability from your dashboard.
      </p>
      <p>
        <a href="${dashboardUrl.toString()}">
          View your mentor dashboard
        </a>
      </p>
    `
      : `
      <h1>Update on your mentor profile</h1>
      <p>Hi ${recipientFullName},</p>
      <p>
        Your CYF mentor profile has been reviewed and has not been approved
        at this time.
      </p>
      <p>
        Please contact the CYF team if you need more information.
      </p>
      <p>
        <a href="${dashboardUrl.toString()}">
          View your mentor dashboard
        </a>
      </p>
    `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Mentor approval decision email for ${email}: ${approvalStatus}`,
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
          Data: subject,
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
      this.logger.error(
        'Failed to send mentor approval decision email: ',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to send mentor approval decision email',
      );
    }
  }

  async sendChemistryProposalEmail({
    email,
    mentorFullName,
    menteeFullName,
  }: SendChemistryProposalEmailParams): Promise<void> {
    const dashboardUrl = new URL('/mentor/dashboard', this.frontendUrl);

    const recipientFullName = mentorFullName.trim();

    const html = `
      <h1>New chemistry session proposal</h1>
      <p>Hi ${recipientFullName},</p>
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

  async sendChemistryAcceptedEmail({
    email,
    menteeFullName,
    mentorFullName,
  }: SendChemistryAcceptedEmailParams): Promise<void> {
    const dashboardUrl = new URL('/mentee/dashboard', this.frontendUrl);

    const recipientFullName = menteeFullName.trim();

    const html = `
      <h1>Your chemistry proposal was accepted</h1>
      <p>Hi ${recipientFullName},</p>
      <p>${mentorFullName} has accepted your chemistry session proposal.</p>
      <p>
        Please log in to your mentee dashboard to view their contact details
        and arrange your chemistry session.
      </p>
      <p>
        Once you have booked the session, you can record that on your dashboard.
      </p>
      <p>
        <a href="${dashboardUrl.toString()}">
          View your mentor
        </a>
      </p>
    `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Chemistry accepted email for ${email}: ${dashboardUrl.toString()}`,
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
          Data: 'Your mentor accepted your chemistry proposal',
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
      this.logger.error('Failed to send chemistry accepted email: ', error);

      throw new InternalServerErrorException(
        'Unable to send chemistry accepted email',
      );
    }
  }

  async sendMentorshipCheckInEmail({
    email,
    fullName,
    counterpartFullName,
    recipientRole,
  }: SendMentorshipCheckInEmailParams): Promise<void> {
    const dashboardPath =
      recipientRole === 'mentor' ? '/mentor/dashboard' : '/mentee/dashboard';

    const dashboardUrl = new URL(dashboardPath, this.frontendUrl);

    const recipientFullName = fullName.trim();

    const html = `
      <h1>Chemistry session check-in</h1>
      <p>Hi ${recipientFullName},</p>
      <p>
        It has been one week since you and ${counterpartFullName}
        agreed to have a chemistry session.
      </p>
      <p>
        Please let us know whether you would like to continue
        and start the mentorship.
      </p>
      <p>
        <a href="${dashboardUrl.toString()}">
          Complete your check-in
        </a>
      </p>
    `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Mentorship check-in email for ${email}: ${dashboardUrl.toString()}`,
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
          Data: 'Your CYF Mentorship chemistry check-in',
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
      this.logger.error('Failed to send mentorship check-in email: ', error);

      throw new InternalServerErrorException(
        'Unable to send mentorship check-in email',
      );
    }
  }

  async sendMatchExpiredEmail({
    email,
    fullName,
    counterpartFullName,
    recipientRole,
  }: SendMatchExpiredEmailParams): Promise<void> {
    const dashboardPath =
      recipientRole === 'mentor' ? '/mentor/dashboard' : '/mentee/dashboard';
    const dashboardUrl = new URL(dashboardPath, this.frontendUrl);
    const recipientFullName = fullName.trim();

    const html = `
      <h1>Your mentorship match has ended</h1>
      <p>Hi ${recipientFullName},</p>
      <p>
        The mentorship match with ${counterpartFullName} has been released
        because the one-week check-in did not receive a response from both people.
      </p>
      <p>
        ${recipientRole === 'mentee' ? 'You can request another mentor match from your dashboard.' : 'Your mentoring capacity is now available again.'}
      </p>
      <p>
        <a href="${dashboardUrl.toString()}">Open your dashboard</a>
      </p>
    `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Match expired email for ${email}: ${dashboardUrl.toString()}`,
      );
      return;
    }

    const command = new SendEmailCommand({
      Source: this.emailFrom,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Data: 'Your CYF Mentorship match has ended',
          Charset: 'UTF-8',
        },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      this.logger.error('Failed to send match expired email: ', error);
      throw new InternalServerErrorException(
        'Unable to send match expired email',
      );
    }
  }

  async sendAdminMentorReadyForReviewEmail({
    email,
    adminFullName,
    mentorFullName,
    mentorEmail,
  }: sendAdminMentorReadyForReviewEmailParams): Promise<void> {
    const adminUrl = new URL('/admin', this.frontendUrl);

    const adminName = adminFullName.trim();

    const html = `
      <h1>Mentor profile waiting for an approval</h1>
      <p>Hi ${adminName},</p>
      <p>
        ${mentorFullName} (${mentorEmail}) has completed profile,
        please login to review it.
      </p>
      <p>
        The new mentor profile have been added to the mentor list.
      </p>
      <p>
        <a href="${adminUrl.toString()}">
          Review the mentor profile.
        </a>
      </p>
    `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Mentor profile approval admin email for ${email}: ${adminUrl.toString()}`,
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
          Data: 'A mentor has completed profile, waiting for review',
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
      this.logger.error(`Failed to send mentor approval admin email: `, error);
      throw new InternalServerErrorException(
        'Unable to send mentor approval admin email',
      );
    }
  }

  async sendMenteeWaitingListAdminEmail({
    email,
    adminFullName,
    menteeFullName,
    menteeEmail,
  }: SendMenteeWaitingListAdminEmailParams): Promise<void> {
    const adminUrl = new URL('/admin', this.frontendUrl);

    const recipientFullName = adminFullName.trim();

    const html = `
      <h1>Mentee waiting for a mentor</h1>
      <p>Hi ${recipientFullName},</p>
      <p>
        ${menteeFullName} (${menteeEmail}) has completed matching,
        but no suitable available mentor could currently be found.
      </p>
      <p>
        They have been added to the mentorship waiting list.
      </p>
      <p>
        <a href="${adminUrl.toString()}">
          Review the waiting list
        </a>
      </p>
    `;

    if (this.emailProvider === 'console') {
      this.logger.log(
        `Waiting-list admin email for ${email}: ${adminUrl.toString()}`,
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
          Data: 'A mentee has joined the mentorship waiting list',
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
      this.logger.error('Failed to send waiting-list admin email: ', error);

      throw new InternalServerErrorException(
        'Unable to send waiting-list admin email',
      );
    }
  }
}
