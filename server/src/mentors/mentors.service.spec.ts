import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MentorsService, MentorProfileWithRelations } from './mentors.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import {
  Region,
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  ApprovalStatus,
  Role,
} from '../generated/prisma/enums';
import { User } from '../generated/prisma/client';
import { MailService } from '../mail/mail.service';

describe('MentorsService', () => {
  let service: MentorsService;
  let prisma: PrismaService;

  const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

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

  const mockFullMentorProfile: MentorProfileWithRelations = {
    id: 'profile-uuid-9876',
    userId: MOCK_USER_ID,
    currentJobTitle: mockMentorDto.currentJobTitle,
    capacity: mockMentorDto.capacity,
    region: Region.CAPE_TOWN,
    openToRemote: mockMentorDto.openToRemote,
    availability: mockMentorDto.availability,
    meetingCadence: mockMentorDto.meetingCadence,
    meetingStructure: mockMentorDto.meetingStructure,
    bio: mockMentorDto.bio,
    isAcceptingMentees: false,
    approvalStatus: ApprovalStatus.PENDING,
    notifiedAdminAt: null,
    profileReceivedEmailSentAt: new Date('2026-08-20T12:00:00.000Z'),
    approvalDecisionEmailSentAt: null,
    user: {
      id: MOCK_USER_ID,
      fullName: 'Test User',
      email: 'test@example.com',
      linkedinURL: 'https://linkedin.com/in/testmentor',
      scheduleURL: '',
    },
    mentorDisciplines: [
      { disciplineId: 'disc-1', discipline: { name: 'Software Engineering' } },
    ],
    mentorSkills: [{ skillId: 'skill-1', skill: { name: 'Node.js' } }],
    mentorDomainIndustries: [
      { industryId: 'ind-1', industry: { name: 'Technology' } },
    ],
  };

  const mockPrismaService = {
    $transaction: jest
      .fn()
      .mockImplementation(
        async <T>(
          cb: (tx: typeof mockPrismaService) => Promise<T>,
        ): Promise<T> => cb(mockPrismaService),
      ),
    user: {
      update: jest.fn(),
      findMany: jest.fn(),
    },
    mentorProfile: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    discipline: {
      upsert: jest.fn(),
    },
    skill: {
      upsert: jest.fn(),
    },
    industry: {
      upsert: jest.fn(),
    },
    mentorDisciplines: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    mentorSkills: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    mentorDomainIndustries: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockMailService = {
    sendAdminMentorReadyForReviewEmail: jest.fn(),
    sendMentorProfileReceivedEmail: jest.fn(),
  };

  const mockUser: User = {
    id: MOCK_USER_ID,
    email: 'test@example.com',
    fullName: 'Test User',
    role: Role.MENTOR,
    passwordHashed: 'hashedpassword',
    linkedinURL: 'https://linkedin.com/in/testmentor',
    scheduleURL: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    isEmailVerified: true,
    emailVerificationTokenHash: null,
    emailVerificationExpiresAt: null,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    isActive: true,
    deactivatedAt: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrismaService.user.findMany.mockReset().mockResolvedValue([]);
    mockMailService.sendAdminMentorReadyForReviewEmail
      .mockReset()
      .mockResolvedValue(undefined);
    mockMailService.sendMentorProfileReceivedEmail
      .mockReset()
      .mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<MentorsService>(MentorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isProfileComplete & isMatchReady', () => {
    it('should evaluate isProfileComplete as true when all mandatory fields are provided', () => {
      expect(service.isProfileComplete(mockFullMentorProfile)).toBe(true);
    });

    it('should evaluate isProfileComplete as false if mandatory fields are missing', () => {
      const incompleteProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        bio: '',
      };
      expect(service.isProfileComplete(incompleteProfile)).toBe(false);
    });

    it('should evaluate isMatchReady as false when profile is complete but approvalStatus is PENDING', () => {
      const pendingProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        approvalStatus: ApprovalStatus.PENDING,
        isAcceptingMentees: true,
      };
      expect(service.isMatchReady(pendingProfile)).toBe(false);
    });

    it('should evaluate isMatchReady as false when approvalStatus is ACCEPTED but isAcceptingMentees is false', () => {
      const acceptedNotAcceptingProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        approvalStatus: ApprovalStatus.ACCEPTED,
        isAcceptingMentees: false,
      };
      expect(service.isMatchReady(acceptedNotAcceptingProfile)).toBe(false);
    });

    it('should evaluate isMatchReady as true when profile is complete, approvalStatus is ACCEPTED, and isAcceptingMentees is true', () => {
      const matchReadyProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        approvalStatus: ApprovalStatus.ACCEPTED,
        isAcceptingMentees: true,
      };
      expect(service.isMatchReady(matchReadyProfile)).toBe(true);
    });
  });

  describe('upsertProfile (CREATE / REPLACE)', () => {
    it('should upsert a mentor profile and sync relations inside a transaction', async () => {
      const { linkedinURL, scheduleURL } = mockMentorDto;

      const profileData = {
        currentJobTitle: mockMentorDto.currentJobTitle,
        capacity: mockMentorDto.capacity,
        region: mockMentorDto.region,
        openToRemote: mockMentorDto.openToRemote,
        availability: mockMentorDto.availability,
        meetingCadence: mockMentorDto.meetingCadence,
        meetingStructure: mockMentorDto.meetingStructure,
        bio: mockMentorDto.bio,
      };

      const transactionSpy = jest.spyOn(prisma, '$transaction');
      const userUpdateSpy = jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue(mockUser);
      const upsertProfileSpy = jest
        .spyOn(prisma.mentorProfile, 'upsert')
        .mockResolvedValue(mockFullMentorProfile);
      const deleteDisciplinesSpy = jest.spyOn(
        prisma.mentorDisciplines,
        'deleteMany',
      );
      const createDisciplinesSpy = jest.spyOn(
        prisma.mentorDisciplines,
        'createMany',
      );
      const deleteSkillsSpy = jest.spyOn(prisma.mentorSkills, 'deleteMany');
      const createSkillsSpy = jest.spyOn(prisma.mentorSkills, 'createMany');
      const deleteIndustriesSpy = jest.spyOn(
        prisma.mentorDomainIndustries,
        'deleteMany',
      );
      const createIndustriesSpy = jest.spyOn(
        prisma.mentorDomainIndustries,
        'createMany',
      );
      const findUniqueProfileSpy = jest
        .spyOn(prisma.mentorProfile, 'findUnique')
        .mockResolvedValue(mockFullMentorProfile);

      jest
        .spyOn(prisma.discipline, 'upsert')
        .mockResolvedValue({ id: 'disc-1', name: 'Software Engineering' });
      jest
        .spyOn(prisma.skill, 'upsert')
        .mockResolvedValue({ id: 'skill-1', name: 'Node.js' });
      jest
        .spyOn(prisma.industry, 'upsert')
        .mockResolvedValue({ id: 'ind-1', name: 'Technology' });

      const result = await service.upsertProfile(MOCK_USER_ID, mockMentorDto);

      expect(transactionSpy).toHaveBeenCalled();

      expect(userUpdateSpy).toHaveBeenCalledWith({
        where: { id: MOCK_USER_ID },
        data: { linkedinURL, scheduleURL },
      });

      expect(upsertProfileSpy).toHaveBeenCalledWith({
        where: { userId: MOCK_USER_ID },
        create: {
          ...profileData,
          isAcceptingMentees: false,
          user: { connect: { id: MOCK_USER_ID } },
        },
        update: profileData,
      });

      expect(deleteDisciplinesSpy).toHaveBeenCalledWith({
        where: { mentorId: mockFullMentorProfile.id },
      });
      expect(createDisciplinesSpy).toHaveBeenCalledWith({
        data: [{ mentorId: mockFullMentorProfile.id, disciplineId: 'disc-1' }],
      });

      expect(deleteSkillsSpy).toHaveBeenCalledWith({
        where: { mentorId: mockFullMentorProfile.id },
      });
      expect(createSkillsSpy).toHaveBeenCalledWith({
        data: [{ mentorId: mockFullMentorProfile.id, skillId: 'skill-1' }],
      });

      expect(deleteIndustriesSpy).toHaveBeenCalledWith({
        where: { mentorId: mockFullMentorProfile.id },
      });
      expect(createIndustriesSpy).toHaveBeenCalledWith({
        data: [{ mentorId: mockFullMentorProfile.id, industryId: 'ind-1' }],
      });

      expect(findUniqueProfileSpy).toHaveBeenCalledWith({
        where: { id: mockFullMentorProfile.id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              linkedinURL: true,
              scheduleURL: true,
            },
          },
          mentorDisciplines: { include: { discipline: true } },
          mentorSkills: { include: { skill: true } },
          mentorDomainIndustries: { include: { industry: true } },
        },
      });

      expect(result).toEqual({
        ...mockFullMentorProfile,
        isProfileComplete: true,
        isMatchReady: false,
      });
    });
  });

  describe('findByUserId (READ)', () => {
    it('should return profile if found', async () => {
      const findUniqueSpy = jest
        .spyOn(prisma.mentorProfile, 'findUnique')
        .mockResolvedValue(mockFullMentorProfile);

      const result = await service.findByUserId(MOCK_USER_ID);

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { userId: MOCK_USER_ID },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              linkedinURL: true,
              scheduleURL: true,
            },
          },
          mentorDisciplines: { include: { discipline: true } },
          mentorDomainIndustries: { include: { industry: true } },
          mentorSkills: { include: { skill: true } },
        },
      });
      expect(result).toEqual({
        ...mockFullMentorProfile,
        isProfileComplete: true,
        isMatchReady: false,
      });
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      jest.spyOn(prisma.mentorProfile, 'findUnique').mockResolvedValue(null);

      await expect(service.findByUserId(MOCK_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile (PATCH / UPDATE)', () => {
    it('should update and return profile with flags if found', async () => {
      const updateDto: UpdateMentorDto = { capacity: 5 };
      const updatedProfile = { ...mockFullMentorProfile, capacity: 5 };

      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(MOCK_USER_ID, updateDto);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { userId: MOCK_USER_ID },
        data: {
          ...updateDto,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              linkedinURL: true,
              scheduleURL: true,
            },
          },
          mentorDisciplines: { include: { discipline: true } },
          mentorSkills: { include: { skill: true } },
          mentorDomainIndustries: { include: { industry: true } },
        },
      });

      expect(result).toEqual({
        ...updatedProfile,
        isProfileComplete: true,
        isMatchReady: false,
      });
    });

    it('should allow toggling isAcceptingMentees and evaluate isMatchReady correctly', async () => {
      const updateDto: UpdateMentorDto = { isAcceptingMentees: true };
      const updatedProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        approvalStatus: ApprovalStatus.ACCEPTED,
        isAcceptingMentees: true,
      };

      jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(MOCK_USER_ID, updateDto);

      expect(result.isAcceptingMentees).toBe(true);
      expect(result.isMatchReady).toBe(true);
    });

    it('should throw NotFoundException if updating non-existent profile', async () => {
      jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.updateProfile(MOCK_USER_ID, { capacity: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('admin notification when a profile first becomes complete', () => {
    it('should notify every active admin and save the notification time', async () => {
      const updatedProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        notifiedAdminAt: null,
      };

      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(updatedProfile);

      mockPrismaService.user.findMany.mockResolvedValue([
        {
          email: 'alex.admin@example.com',
          fullName: 'Alex Admin',
        },
        {
          email: 'sam.admin@example.com',
          fullName: 'Sam Admin',
        },
      ]);

      const result = await service.updateProfile(MOCK_USER_ID, {
        capacity: 4,
      });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          role: Role.ADMIN,
          isActive: true,
        },
        select: {
          email: true,
          fullName: true,
        },
      });

      expect(
        mockMailService.sendAdminMentorReadyForReviewEmail,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockMailService.sendAdminMentorReadyForReviewEmail,
      ).toHaveBeenCalledWith({
        email: 'alex.admin@example.com',
        adminFullName: 'Alex Admin',
        mentorFullName: 'Test User',
        mentorEmail: 'test@example.com',
      });
      expect(
        mockMailService.sendAdminMentorReadyForReviewEmail,
      ).toHaveBeenCalledWith({
        email: 'sam.admin@example.com',
        adminFullName: 'Sam Admin',
        mentorFullName: 'Test User',
        mentorEmail: 'test@example.com',
      });

      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(result.notifiedAdminAt).toBeInstanceOf(Date);
      expect(updateSpy).toHaveBeenNthCalledWith(2, {
        where: {
          id: mockFullMentorProfile.id,
        },
        data: {
          notifiedAdminAt: result.notifiedAdminAt,
        },
      });
    });

    it('should not notify admins again when a notification time already exists', async () => {
      const existingNotificationTime = new Date('2026-08-20T12:00:00.000Z');
      const updatedProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        notifiedAdminAt: existingNotificationTime,
      };

      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(MOCK_USER_ID, {
        capacity: 4,
      });

      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
      expect(
        mockMailService.sendAdminMentorReadyForReviewEmail,
      ).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result.notifiedAdminAt).toBe(existingNotificationTime);
    });

    it('should not notify admins when the profile is incomplete', async () => {
      const incompleteProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        bio: '',
        notifiedAdminAt: null,
      };

      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(incompleteProfile);

      const result = await service.updateProfile(MOCK_USER_ID, {
        bio: '',
      });

      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
      expect(
        mockMailService.sendAdminMentorReadyForReviewEmail,
      ).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result.notifiedAdminAt).toBeNull();
    });

    it('should leave the notification time empty when an admin email fails', async () => {
      const updatedProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        notifiedAdminAt: null,
      };

      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(updatedProfile);

      mockPrismaService.user.findMany.mockResolvedValue([
        {
          email: 'alex.admin@example.com',
          fullName: 'Alex Admin',
        },
      ]);
      mockMailService.sendAdminMentorReadyForReviewEmail.mockRejectedValue(
        new Error('SES unavailable'),
      );

      const result = await service.updateProfile(MOCK_USER_ID, {
        capacity: 4,
      });

      expect(
        mockMailService.sendAdminMentorReadyForReviewEmail,
      ).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result.notifiedAdminAt).toBeNull();
    });
  });

  describe('mentor profile received notification', () => {
    it('should email the mentor once and save the sent time', async () => {
      const updatedProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        notifiedAdminAt: new Date('2026-08-20T12:00:00.000Z'),
        profileReceivedEmailSentAt: null,
      };

      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(MOCK_USER_ID, {
        capacity: 4,
      });

      expect(
        mockMailService.sendMentorProfileReceivedEmail,
      ).toHaveBeenCalledWith({
        email: 'test@example.com',
        fullName: 'Test User',
      });
      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(result.profileReceivedEmailSentAt).toBeInstanceOf(Date);
      expect(updateSpy).toHaveBeenNthCalledWith(2, {
        where: {
          id: mockFullMentorProfile.id,
        },
        data: {
          profileReceivedEmailSentAt: result.profileReceivedEmailSentAt,
        },
      });
    });

    it('should not send the profile received email again', async () => {
      const updatedProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        notifiedAdminAt: new Date('2026-08-20T12:00:00.000Z'),
      };

      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(MOCK_USER_ID, {
        capacity: 4,
      });

      expect(
        mockMailService.sendMentorProfileReceivedEmail,
      ).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result.profileReceivedEmailSentAt).toBe(
        updatedProfile.profileReceivedEmailSentAt,
      );
    });

    it('should retry a failed mentor email when the mentor saves again', async () => {
      const updatedProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        notifiedAdminAt: new Date('2026-08-20T12:00:00.000Z'),
        profileReceivedEmailSentAt: null,
      };

      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(updatedProfile);
      mockMailService.sendMentorProfileReceivedEmail
        .mockRejectedValueOnce(new Error('SES unavailable'))
        .mockResolvedValueOnce(undefined);

      const firstResult = await service.updateProfile(MOCK_USER_ID, {
        capacity: 4,
      });

      expect(firstResult.profileReceivedEmailSentAt).toBeNull();

      const secondResult = await service.updateProfile(MOCK_USER_ID, {
        capacity: 5,
      });

      expect(
        mockMailService.sendMentorProfileReceivedEmail,
      ).toHaveBeenCalledTimes(2);
      expect(updateSpy).toHaveBeenCalledTimes(3);
      expect(secondResult.profileReceivedEmailSentAt).toBeInstanceOf(Date);
    });

    it('should automatically retry only missing admin notifications', async () => {
      const pendingProfile: MentorProfileWithRelations = {
        ...mockFullMentorProfile,
        notifiedAdminAt: null,
        profileReceivedEmailSentAt: null,
      };

      mockPrismaService.mentorProfile.findMany.mockResolvedValue([
        pendingProfile,
      ]);
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          email: 'alex.admin@example.com',
          fullName: 'Alex Admin',
        },
      ]);
      const updateSpy = jest
        .spyOn(prisma.mentorProfile, 'update')
        .mockResolvedValue(pendingProfile);

      await service.retryPendingAdminNotifications();

      expect(mockPrismaService.mentorProfile.findMany).toHaveBeenCalledWith({
        where: {
          approvalStatus: ApprovalStatus.PENDING,
          notifiedAdminAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              linkedinURL: true,
              scheduleURL: true,
            },
          },
          mentorDisciplines: {
            include: {
              discipline: true,
            },
          },
          mentorSkills: {
            include: {
              skill: true,
            },
          },
          mentorDomainIndustries: {
            include: {
              industry: true,
            },
          },
        },
      });
      expect(
        mockMailService.sendMentorProfileReceivedEmail,
      ).not.toHaveBeenCalled();
      expect(
        mockMailService.sendAdminMentorReadyForReviewEmail,
      ).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(pendingProfile.profileReceivedEmailSentAt).toBeNull();
      expect(pendingProfile.notifiedAdminAt).toBeInstanceOf(Date);
    });
  });

  describe('deleteProfile (DELETE)', () => {
    it('should delete profile if it exists', async () => {
      jest
        .spyOn(prisma.mentorProfile, 'findUnique')
        .mockResolvedValue(mockFullMentorProfile);
      const deleteSpy = jest
        .spyOn(prisma.mentorProfile, 'delete')
        .mockResolvedValue(mockFullMentorProfile);

      const result = await service.deleteProfile(MOCK_USER_ID);

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { userId: MOCK_USER_ID },
      });
      expect(result).toEqual(mockFullMentorProfile);
    });

    it('should throw NotFoundException if deleting non-existent profile', async () => {
      jest.spyOn(prisma.mentorProfile, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.mentorProfile, 'delete')
        .mockRejectedValue(new NotFoundException());

      await expect(service.deleteProfile(MOCK_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
