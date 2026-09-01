import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

import { SendEmailCommand } from '@aws-sdk/client-ses';

import { MailService } from './mail.service';

const sesSendMock = jest.fn();

jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({
    send: sesSendMock,
  })),

  SendEmailCommand: jest.fn(),
}));

describe('MailService', () => {
  let service: MailService;

  const createMailService = async (emailProvider = 'ses') => {
    const configServiceMock = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          EMAIL_FROM: 'CYF Mentorship <mentorship@cyf.academy>',
          FRONTEND_URL: 'http://localhost:5173',
          EMAIL_PROVIDER: emailProvider,
        };

        const value = values[key];

        if (value === undefined) {
          throw new Error(`Missing configuration value: ${key}`);
        }

        return value;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    return module.get<MailService>(MailService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    sesSendMock.mockReset();

    service = await createMailService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a verification email with the correct details', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'email-id',
    });

    await service.sendVerificationEmail({
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      token: 'verification-token',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Source).toBe('CYF Mentorship <mentorship@cyf.academy>');

    expect(commandInput.Destination?.ToAddresses).toEqual(['jane@example.com']);

    expect(commandInput.Message?.Subject?.Data).toBe(
      'Verify your CYF Mentorship email',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain(
      'http://localhost:5173/verify-email?token=verification-token',
    );

    expect(html).toContain('Hi Jane Doe,');

    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should throw when AWS SES returns an error', async () => {
    sesSendMock.mockRejectedValue(new Error('SES unavailable'));

    const action = service.sendVerificationEmail({
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      token: 'verification-token',
    });

    await expect(action).rejects.toBeInstanceOf(InternalServerErrorException);

    await expect(action).rejects.toThrow('Unable to send verification email');
  });

  it('should send a password reset email with the correct details', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'password-reset-email-id',
    });

    await service.sendPasswordResetEmail({
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      token: 'password-reset-token',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Source).toBe('CYF Mentorship <mentorship@cyf.academy>');
    expect(commandInput.Destination?.ToAddresses).toEqual(['jane@example.com']);
    expect(commandInput.Message?.Subject?.Data).toBe(
      'Reset your CYF Mentorship password',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain(
      'http://localhost:5173/reset-password?token=password-reset-token',
    );
    expect(html).toContain('Hi Jane Doe,');
    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should send a profile received email to the mentor', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'profile-received-email-id',
    });

    await service.sendMentorProfileReceivedEmail({
      email: 'amina@example.com',
      fullName: 'Amina Patel',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Source).toBe('CYF Mentorship <mentorship@cyf.academy>');

    expect(commandInput.Destination?.ToAddresses).toEqual([
      'amina@example.com',
    ]);

    expect(commandInput.Message?.Subject?.Data).toBe(
      'Your CYF mentor profile has been received',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain('<p>Hi Amina Patel</p>');
    expect(html).toContain('http://localhost:5173/mentor/dashboard');

    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should tell the mentor when their profile is accepted', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'profile-accepted-email-id',
    });

    await service.sendMentorApprovalDecisionEmail({
      email: 'amina@example.com',
      fullName: 'Amina Patel',
      approvalStatus: 'ACCEPTED',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Destination?.ToAddresses).toEqual([
      'amina@example.com',
    ]);
    expect(commandInput.Message?.Subject?.Data).toBe(
      'Your CYF mentor profile has been approved',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain('Hi Amina Patel,');
    expect(html).toContain('reviewed and approved');
    expect(html).toContain('http://localhost:5173/mentor/dashboard');
    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should tell the mentor when their profile is declined', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'profile-declined-email-id',
    });

    await service.sendMentorApprovalDecisionEmail({
      email: 'amina@example.com',
      fullName: 'Amina Patel',
      approvalStatus: 'DECLINED',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Destination?.ToAddresses).toEqual([
      'amina@example.com',
    ]);
    expect(commandInput.Message?.Subject?.Data).toBe(
      'Update on your CYF mentor profile',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain('Hi Amina Patel,');
    expect(html).toContain('has not been approved');
    expect(html).toContain('http://localhost:5173/mentor/dashboard');
    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should send a mentor waiting for approval email to the admin', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'mentor-waiting-for-approval-email-id',
    });

    await service.sendAdminMentorReadyForReviewEmail({
      email: 'admin@example.com',
      adminFullName: 'Alex Admin',
      mentorFullName: 'Amina Patel',
      mentorEmail: 'amina@example.com',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Source).toBe('CYF Mentorship <mentorship@cyf.academy>');

    expect(commandInput.Destination?.ToAddresses).toEqual([
      'admin@example.com',
    ]);

    expect(commandInput.Message?.Subject?.Data).toBe(
      'A mentor has completed profile, waiting for review',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain('Hi Alex Admin,');
    expect(html).toContain('Amina Patel');
    expect(html).toContain('amina@example.com');
    expect(html).toContain('http://localhost:5173/admin');

    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should send a chemistry proposal email to the mentor', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'chemistry-email-id',
    });

    await service.sendChemistryProposalEmail({
      email: 'amina@example.com',
      mentorFullName: 'Amina Patel',
      menteeFullName: 'Casey Morgan',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Source).toBe('CYF Mentorship <mentorship@cyf.academy>');

    expect(commandInput.Destination?.ToAddresses).toEqual([
      'amina@example.com',
    ]);

    expect(commandInput.Message?.Subject?.Data).toBe(
      'New chemistry session proposal',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain('Hi Amina Patel,');
    expect(html).toContain('Casey Morgan');
    expect(html).toContain('http://localhost:5173/mentor/dashboard');

    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should send a chemistry accepted email to the mentee', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'chemistry-accepted-email-id',
    });

    await service.sendChemistryAcceptedEmail({
      email: 'casey@example.com',
      menteeFullName: 'Casey Morgan',
      mentorFullName: 'Amina Patel',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Source).toBe('CYF Mentorship <mentorship@cyf.academy>');

    expect(commandInput.Destination?.ToAddresses).toEqual([
      'casey@example.com',
    ]);

    expect(commandInput.Message?.Subject?.Data).toBe(
      'Your mentor accepted your chemistry proposal',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain('Hi Casey Morgan,');
    expect(html).toContain('Amina Patel');
    expect(html).toContain('http://localhost:5173/mentee/dashboard');

    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should send a mentorship check-in email', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'check-in-email-id',
    });

    await service.sendMentorshipCheckInEmail({
      email: 'casey@example.com',
      fullName: 'Casey Morgan',
      counterpartFullName: 'Amina Patel',
      recipientRole: 'mentee',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Destination?.ToAddresses).toEqual([
      'casey@example.com',
    ]);

    expect(commandInput.Message?.Subject?.Data).toBe(
      'Your CYF Mentorship chemistry check-in',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain('Hi Casey Morgan,');
    expect(html).toContain('Amina Patel');
    expect(html).toContain('http://localhost:5173/mentee/dashboard');

    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should send a waiting-list email to the admin', async () => {
    sesSendMock.mockResolvedValue({
      MessageId: 'waiting-list-email-id',
    });

    await service.sendMenteeWaitingListAdminEmail({
      email: 'admin@example.com',
      adminFullName: 'Alex Admin',
      menteeFullName: 'Casey Morgan',
      menteeEmail: 'casey@example.com',
    });

    expect(SendEmailCommand).toHaveBeenCalledTimes(1);

    const commandInput = (
      SendEmailCommand as jest.MockedClass<typeof SendEmailCommand>
    ).mock.calls[0][0];

    expect(commandInput.Source).toBe('CYF Mentorship <mentorship@cyf.academy>');
    expect(commandInput.Destination?.ToAddresses).toEqual([
      'admin@example.com',
    ]);
    expect(commandInput.Message?.Subject?.Data).toBe(
      'A mentee has joined the mentorship waiting list',
    );

    const html = commandInput.Message?.Body?.Html?.Data;

    expect(html).toContain('Hi Alex Admin,');
    expect(html).toContain('Casey Morgan');
    expect(html).toContain('casey@example.com');
    expect(html).toContain('http://localhost:5173/admin');
    expect(sesSendMock).toHaveBeenCalledTimes(1);
  });

  it('should not call AWS SES when the email provider is console', async () => {
    const consoleService = await createMailService('console');

    await consoleService.sendVerificationEmail({
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      token: 'verification-token',
    });

    expect(SendEmailCommand).not.toHaveBeenCalled();
    expect(sesSendMock).not.toHaveBeenCalled();
  });
});
