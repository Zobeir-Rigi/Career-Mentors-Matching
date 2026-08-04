import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

import { MailService } from './mail.service';

const resendSendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: resendSendMock,
    },
  })),
}));

describe('MailService', () => {
  let service: MailService;

  const configServiceMock = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        RESEND_API_KEY: 're_test_key',
        EMAIL_FROM: 'CYF Mentorship <onboarding@resend.dev>',
        FRONTEND_URL: 'http://localhost:5173',
      };

      return values[key];
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a verification email with the correct details', async () => {
    resendSendMock.mockResolvedValue({
      data: {
        id: 'email-id',
      },
      error: null,
    });

    await service.sendVerificationEmail({
      email: 'jane@example.com',
      fullName: 'Jane Doe',
      token: 'verification-token',
    });

    expect(resendSendMock).toHaveBeenCalledTimes(1);

    const expectedEmailPayload: {
      from: string;
      to: string;
      subject: string;
      html: unknown;
    } = {
      from: 'CYF Mentorship <onboarding@resend.dev>',
      to: 'jane@example.com',
      subject: 'Verify your CYF Mentorship email',
      html: expect.stringContaining(
        'http://localhost:5173/verify-email?token=verification-token',
      ),
    };

    expect(resendSendMock).toHaveBeenCalledWith(expectedEmailPayload);

    const expectedEmailBody: { html: unknown } = {
      html: expect.stringContaining('Hi Jane Doe,'),
    };

    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining(expectedEmailBody),
    );
  });

  it('should throw when Resend returns an error', async () => {
    resendSendMock.mockResolvedValue({
      data: null,
      error: {
        message: 'Resend unavailable',
      },
    });

    await expect(
      service.sendVerificationEmail({
        email: 'jane@example.com',
        fullName: 'Jane Doe',
        token: 'verification-token',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    await expect(
      service.sendVerificationEmail({
        email: 'jane@example.com',
        fullName: 'Jane Doe',
        token: 'verification-token',
      }),
    ).rejects.toThrow('Unable to send verification email');
  });
});
