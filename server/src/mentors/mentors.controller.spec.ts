import { Test, TestingModule } from '@nestjs/testing';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { RequestWithUser } from '../auth/guards/jwt-auth.guard';
import {
  Region,
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  ApprovalStatus,
} from '../generated/prisma/enums';

describe('MentorsController', () => {
  let controller: MentorsController;
  let service: MentorsService;

  const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
  const MOCK_PROFILE_ID = 'profile-uuid-9876';
  const MOCK_EMAIL = 'test.mentor@example.com';
  const MOCK_ROLE = 'MENTOR';

  const mockRequest = {
    user: {
      userId: MOCK_USER_ID,
      email: MOCK_EMAIL,
      role: MOCK_ROLE,
    },
  } as RequestWithUser;

  const mockMentorDto: CreateMentorDto = {
    currentJobTitle: 'Senior Backend Engineer',
    capacity: 3,
    region: Region.CAPE_TOWN,
    openToRemote: true,
    availability: [
      AvailabilityOption.WEEKDAY_AFTERNOON,
      AvailabilityOption.WEEKEND_EVENING,
    ],
    meetingCadence: MeetingCadence.FORTNIGHTLY,
    meetingStructure: MeetingStructure.OPEN,
    bio: '10+ years in Node.js and systems architecture.',
    linkedinURL: 'https://linkedin.com/in/testmentor',
    scheduleURL: '',
    disciplines: ['Software Engineering'],
    skills: ['Node.js'],
    industries: ['Technology'],
  };

  const mockMentorProfileResponse = {
    id: 'profile-uuid-9876',
    userId: MOCK_USER_ID,
    ...mockMentorDto,
    isAcceptingMentees: false,
    approvalStatus: ApprovalStatus.PENDING,
    notifiedAdminAt: null,
    isProfileComplete: true,
    isMatchReady: false,
    user: {
      id: MOCK_USER_ID,
      fullName: 'Test User',
      email: MOCK_EMAIL,
      linkedinURL: 'https://linkedin.com/in/testmentor',
      scheduleURL: '',
    },
    mentorDisciplines: [
      {
        mentorId: MOCK_PROFILE_ID,
        disciplineId: 'disc-1',
        discipline: { id: 'disc-1', name: 'Software Engineering' },
      },
    ],
    mentorSkills: [
      {
        mentorId: MOCK_PROFILE_ID,
        skillId: 'skill-1',
        skill: { id: 'skill-1', name: 'Node.js' },
      },
    ],
    mentorDomainIndustries: [
      {
        mentorId: MOCK_PROFILE_ID,
        industryId: 'ind-1',
        industry: { id: 'ind-1', name: 'Technology' },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorsController],
      providers: [
        {
          provide: MentorsService,
          useValue: {
            findByUserId: jest
              .fn()
              .mockResolvedValue(mockMentorProfileResponse),
            upsertProfile: jest
              .fn()
              .mockResolvedValue(mockMentorProfileResponse),
            updateProfile: jest.fn().mockResolvedValue({
              ...mockMentorProfileResponse,
              capacity: 5,
            }),
            deleteProfile: jest
              .fn()
              .mockResolvedValue(mockMentorProfileResponse),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MentorsController>(MentorsController);
    service = module.get<MentorsService>(MentorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upsertMyProfile (CREATE / REPLACE)', () => {
    it('should create or update a mentor profile', async () => {
      const upsertSpy = jest.spyOn(service, 'upsertProfile');
      const result = await controller.upsertMyProfile(
        mockRequest,
        mockMentorDto,
      );
      expect(upsertSpy).toHaveBeenCalledWith(MOCK_USER_ID, mockMentorDto);
      expect(result).toEqual(mockMentorProfileResponse);
    });
  });

  describe('getMyProfile (READ)', () => {
    it('should return the current user profile', async () => {
      const findByUserIdSpy = jest.spyOn(service, 'findByUserId');
      const result = await controller.getMyProfile(mockRequest);
      expect(findByUserIdSpy).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(result).toEqual(mockMentorProfileResponse);
    });
  });

  describe('updateMyProfile (PATCH / UPDATE)', () => {
    it('should partially update the mentor profile', async () => {
      const updateProfileSpy = jest.spyOn(service, 'updateProfile');
      const updateDto = { capacity: 5 };
      const result = await controller.updateMyProfile(mockRequest, updateDto);
      expect(updateProfileSpy).toHaveBeenCalledWith(MOCK_USER_ID, updateDto);
      expect(result.capacity).toBe(5);
      expect(result.isProfileComplete).toBe(true);
      expect(result.isMatchReady).toBe(false);
    });

    it('should allow toggling isAcceptingMentees and return updated status flags', async () => {
      const updateDto = { isAcceptingMentees: true };
      const updatedResponse = {
        ...mockMentorProfileResponse,
        isAcceptingMentees: true,
        approvalStatus: ApprovalStatus.ACCEPTED,
        isMatchReady: true,
      };

      const updateSpy = jest
        .spyOn(service, 'updateProfile')
        .mockResolvedValueOnce(updatedResponse);

      const result = await controller.updateMyProfile(mockRequest, updateDto);

      expect(updateSpy).toHaveBeenCalledWith(MOCK_USER_ID, updateDto);
      expect(result.isAcceptingMentees).toBe(true);
      expect(result.isMatchReady).toBe(true);
    });
  });

  describe('deleteMyProfile (DELETE)', () => {
    it('should delete the mentor profile', async () => {
      const deleteProfileSpy = jest.spyOn(service, 'deleteProfile');
      const result = await controller.deleteMyProfile(mockRequest);
      expect(deleteProfileSpy).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(result).toEqual(mockMentorProfileResponse);
    });
  });
});
