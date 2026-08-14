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

  const configServiceMock = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        EMAIL_FROM: 'CYF Mentorship <mentorship@cyf.academy>',
        FRONTEND_URL: 'http://localhost:5173',
      };

      return values[key];
    }),

    get: jest.fn((key: string) => {
      if (key === 'EMAIL_PROVIDER') {
        return 'ses';
      }

      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);

    jest.clearAllMocks();
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

    expect(html).toContain('Hi Jane,');

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
});
