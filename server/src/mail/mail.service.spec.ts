import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

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
});
