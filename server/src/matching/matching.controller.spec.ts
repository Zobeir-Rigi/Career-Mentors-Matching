import { Test, TestingModule } from '@nestjs/testing';

import { MatchingController } from './matching.controller';

import { MatchingAlgoService } from './services/matching-algo.service';
import { MatchingRequestService } from './services/matching-request.service';

import {
  JwtAuthGuard,
  type RequestWithUser,
} from '../auth/guards/jwt-auth.guard';
import { Region } from '../generated/prisma/enums';

describe('MatchingController', () => {
  let controller: MatchingController;
  let matchingAlgoService: MatchingAlgoService;

  const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

  const mockRequest = {
    user: {
      userId: MOCK_USER_ID,
      email: 'mentee@example.com',
      role: 'MENTEE',
    },
  } as RequestWithUser;

  const mockRecommendations = [
    {
      mentorId: 'mentor-profile-1',
      userId: 'mentor-user-1',
      score: 92,
      categoryScores: {
        disciplines: 1,
        skills: 0.8,
        industries: 0.5,
        availability: 1,
        location: 1,
        meetingStructure: 1,
        meetingCadence: 1,
      },
      profile: {
        fullName: 'Jane Smith',
        currentJobTitle: 'Senior Software Engineer',
        region: Region.LONDON,
        openToRemote: true,
        bio: 'Experienced software engineer',
        linkedinURL: 'https://linkedin.com/in/janesmith',
      },
    },
  ];

  const matchingRequestServiceMock = {
    requestMatch: jest.fn(),
    proposeChemistry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchingController],
      providers: [
        {
          provide: MatchingAlgoService,
          useValue: {
            findBestMatches: jest.fn(),
          },
        },
        {
          provide: MatchingRequestService,
          useValue: matchingRequestServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActive: () => true })
      .compile();

    controller = module.get<MatchingController>(MatchingController);
    matchingAlgoService = module.get<MatchingAlgoService>(MatchingAlgoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findRecommendations', () => {
    it('should find recommendations for the authenticated mentee', async () => {
      const findBestMatches = jest
        .spyOn(matchingAlgoService, 'findBestMatches')
        .mockResolvedValue(mockRecommendations);

      const result = await controller.findRecommendations(mockRequest);

      expect(findBestMatches).toHaveBeenCalledTimes(1);
      expect(findBestMatches).toHaveBeenCalledWith(MOCK_USER_ID);

      expect(result).toEqual(mockRecommendations);
    });
  });

  it('should not expose mentor email or scheduleURL', async () => {
    jest
      .spyOn(matchingAlgoService, 'findBestMatches')
      .mockResolvedValue(mockRecommendations);

    const result = await controller.findRecommendations(mockRequest);

    expect(result[0].profile).not.toHaveProperty('email');

    expect(result[0].profile).not.toHaveProperty('scheduleURL');

    expect(result[0].profile).toHaveProperty('linkedinURL');
  });

  describe('requestMatch', () => {
    it('requests a mentor recommendation for the authenticated mentee', async () => {
      const response = {
        status: 'RECOMMENDED' as const,
        recommendation: mockRecommendations[0],
      };

      matchingRequestServiceMock.requestMatch.mockResolvedValue(response);

      const result = await controller.requestMatch(mockRequest);

      expect(matchingRequestServiceMock.requestMatch).toHaveBeenCalledWith(
        MOCK_USER_ID,
      );

      expect(result).toEqual(response);
    });
  });

  describe('proposeChemistry', () => {
    it('creates a chemistry proposal for the selected mentor', async () => {
      const response = {
        status: 'CHEMISTRY_PENDING' as const,
        matchId: 'match-id',
      };

      matchingRequestServiceMock.proposeChemistry.mockResolvedValue(response);

      const result = await controller.proposeChemistry(
        mockRequest,
        'mentor-profile-id',
      );

      expect(matchingRequestServiceMock.proposeChemistry).toHaveBeenCalledWith(
        MOCK_USER_ID,
        'mentor-profile-id',
      );

      expect(result).toEqual(response);
    });
  });
});
