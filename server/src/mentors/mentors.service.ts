import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApprovalStatus,
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  Region,
  Role,
} from '../generated/prisma/enums';
import { MailService } from '@/mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface MentorProfileWithRelations {
  id: string;
  userId: string;
  currentJobTitle: string | null;
  capacity: number;
  region: Region | null;
  openToRemote: boolean;
  availability: AvailabilityOption[];
  meetingCadence: MeetingCadence | null;
  meetingStructure: MeetingStructure | null;
  bio: string | null;
  isAcceptingMentees: boolean;
  approvalStatus: ApprovalStatus;
  notifiedAdminAt: Date | null;
  profileReceivedEmailSentAt: Date | null;
  approvalDecisionEmailSentAt: Date | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    linkedinURL: string | null;
    scheduleURL: string | null;
  } | null;
  mentorDisciplines?: { disciplineId: string; discipline?: { name: string } }[];
  mentorSkills?: { skillId: string; skill?: { name: string } }[];
  mentorDomainIndustries?: {
    industryId: string;
    industry?: { name: string };
  }[];
}
@Injectable()
export class MentorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private async getActiveAdmins() {
    return this.prisma.user.findMany({
      where: {
        role: Role.ADMIN,
        isActive: true,
      },
      select: {
        email: true,
        fullName: true,
      },
    });
  }

  private async notifyAdminsMentorReadyForReview({
    mentorFullName,
    mentorEmail,
  }: {
    mentorFullName: string;
    mentorEmail: string;
  }): Promise<boolean> {
    const admins = await this.getActiveAdmins();

    if (admins.length === 0) {
      return false;
    }

    try {
      await Promise.all(
        admins.map((admin) =>
          this.mailService.sendAdminMentorReadyForReviewEmail({
            email: admin.email,
            adminFullName: admin.fullName,
            mentorFullName,
            mentorEmail,
          }),
        ),
      );

      return true;
    } catch {
      return false;
    }
  }

  private async notifyAdminsIfMentorReady(
    profile: MentorProfileWithRelations,
  ): Promise<Date | null> {
    const isComplete = this.isProfileComplete(profile);

    if (
      !isComplete ||
      profile.approvalStatus !== ApprovalStatus.PENDING ||
      profile.notifiedAdminAt
    ) {
      return profile.notifiedAdminAt;
    }

    if (!profile.user) {
      return null;
    }

    const adminNotified = await this.notifyAdminsMentorReadyForReview({
      mentorFullName: profile.user.fullName,
      mentorEmail: profile.user.email,
    });

    if (!adminNotified) {
      return null;
    }

    const notifiedAt = new Date();

    await this.prisma.mentorProfile.update({
      where: {
        id: profile.id,
      },
      data: {
        notifiedAdminAt: notifiedAt,
      },
    });

    return notifiedAt;
  }

  private async notifyMentorProfileReceived(
    profile: MentorProfileWithRelations,
  ): Promise<Date | null> {
    if (
      !this.isProfileComplete(profile) ||
      profile.approvalStatus !== ApprovalStatus.PENDING ||
      profile.profileReceivedEmailSentAt
    ) {
      return profile.profileReceivedEmailSentAt;
    }

    if (!profile.user) {
      return null;
    }

    try {
      await this.mailService.sendMentorProfileReceivedEmail({
        email: profile.user.email,
        fullName: profile.user.fullName,
      });

      const sentAt = new Date();

      await this.prisma.mentorProfile.update({
        where: {
          id: profile.id,
        },
        data: {
          profileReceivedEmailSentAt: sentAt,
        },
      });

      return sentAt;
    } catch {
      return null;
    }
  }

  // 1. Checks if all mandatory fields are filled out
  public isProfileComplete(profile: MentorProfileWithRelations): boolean {
    return Boolean(
      profile.currentJobTitle?.trim() &&
      profile.region &&
      profile.bio?.trim() &&
      Array.isArray(profile.availability) &&
      profile.availability.length > 0 &&
      profile.capacity >= 1 &&
      Array.isArray(profile.mentorDisciplines) &&
      profile.mentorDisciplines.length > 0 &&
      profile.meetingCadence &&
      profile.meetingStructure &&
      profile.user?.linkedinURL?.trim(),
    );
  }

  // 2. Checks if mentor is approved and ready for matching
  public isMatchReady(profile: MentorProfileWithRelations): boolean {
    return (
      this.isProfileComplete(profile) &&
      profile.approvalStatus === 'ACCEPTED' &&
      profile.isAcceptingMentees === true
    );
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.mentorProfile.findUnique({
      where: { userId },
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
        mentorSkills: { include: { skill: true } },
        mentorDisciplines: { include: { discipline: true } },
        mentorDomainIndustries: { include: { industry: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException(
        `Mentor profile for user ID ${userId} not found`,
      );
    }

    return {
      ...profile,
      isProfileComplete: this.isProfileComplete(profile),
      isMatchReady: this.isMatchReady(profile),
    };
  }

  async upsertProfile(userId: string, dto: CreateMentorDto) {
    const {
      linkedinURL,
      scheduleURL,
      disciplines = [],
      skills = [],
      industries = [],
      ...profileData
    } = dto;

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { linkedinURL, scheduleURL },
      });

      const profile = await tx.mentorProfile.upsert({
        where: { userId },
        create: {
          ...profileData,
          isAcceptingMentees: false,
          user: { connect: { id: userId } },
        },
        update: profileData,
      });

      await tx.mentorDisciplines.deleteMany({
        where: { mentorId: profile.id },
      });

      if (disciplines.length > 0) {
        const disciplineRecords = await Promise.all(
          disciplines.map((name) =>
            tx.discipline.upsert({
              where: { name },
              create: { name },
              update: {},
            }),
          ),
        );

        await tx.mentorDisciplines.createMany({
          data: disciplineRecords.map((discipline) => ({
            mentorId: profile.id,
            disciplineId: discipline.id,
          })),
        });
      }

      await tx.mentorSkills.deleteMany({
        where: { mentorId: profile.id },
      });

      if (skills.length > 0) {
        const skillRecords = await Promise.all(
          skills.map((name) =>
            tx.skill.upsert({
              where: { name },
              create: { name },
              update: {},
            }),
          ),
        );

        await tx.mentorSkills.createMany({
          data: skillRecords.map((skill) => ({
            mentorId: profile.id,
            skillId: skill.id,
          })),
        });
      }

      await tx.mentorDomainIndustries.deleteMany({
        where: { mentorId: profile.id },
      });

      if (industries.length > 0) {
        const industryRecords = await Promise.all(
          industries.map((name) =>
            tx.industry.upsert({
              where: { name },
              create: { name },
              update: {},
            }),
          ),
        );

        await tx.mentorDomainIndustries.createMany({
          data: industryRecords.map((industry) => ({
            mentorId: profile.id,
            industryId: industry.id,
          })),
        });
      }

      const updatedProfile = await tx.mentorProfile.findUnique({
        where: { id: profile.id },
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

      if (!updatedProfile) {
        throw new NotFoundException(
          'Failed to retrieve updated mentor profile',
        );
      }

      // Check if profile is newly complete and needs admin notification stamp
      const isComplete = this.isProfileComplete(updatedProfile);

      return {
        ...updatedProfile,
        isProfileComplete: isComplete,
        isMatchReady: this.isMatchReady(updatedProfile),
      };
    });

    const profileReceivedEmailSentAt =
      await this.notifyMentorProfileReceived(result);

    if (profileReceivedEmailSentAt) {
      result.profileReceivedEmailSentAt = profileReceivedEmailSentAt;
    }

    const notifiedAt = await this.notifyAdminsIfMentorReady(result);

    if (notifiedAt) {
      result.notifiedAdminAt = notifiedAt;
    }

    return result;
  }

  async updateProfile(userId: string, dto: UpdateMentorDto) {
    const { linkedinURL, scheduleURL, ...profileData } = dto;

    const profile = await this.prisma.mentorProfile.update({
      where: { userId },
      data: {
        ...profileData,
        ...(linkedinURL !== undefined || scheduleURL !== undefined
          ? {
              user: {
                update: {
                  ...(linkedinURL !== undefined && { linkedinURL }),
                  ...(scheduleURL !== undefined && { scheduleURL }),
                },
              },
            }
          : {}),
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

    // Check if profile is newly complete and needs admin notification stamp
    const isComplete = this.isProfileComplete(profile);

    const profileReceivedEmailSentAt =
      await this.notifyMentorProfileReceived(profile);

    if (profileReceivedEmailSentAt) {
      profile.profileReceivedEmailSentAt = profileReceivedEmailSentAt;
    }

    const notifiedAdminAt = await this.notifyAdminsIfMentorReady(profile);

    if (notifiedAdminAt) {
      profile.notifiedAdminAt = notifiedAdminAt;
    }

    return {
      ...profile,
      isProfileComplete: isComplete,
      isMatchReady: this.isMatchReady(profile),
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async retryPendingAdminNotifications(): Promise<void> {
    const profiles = await this.prisma.mentorProfile.findMany({
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

    for (const profile of profiles) {
      const notifiedAdminAt = await this.notifyAdminsIfMentorReady(profile);

      if (notifiedAdminAt) {
        profile.notifiedAdminAt = notifiedAdminAt;
      }
    }
  }

  async deleteProfile(userId: string) {
    const profile = await this.prisma.mentorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException(
        `Mentor profile for user ID ${userId} not found`,
      );
    }

    return this.prisma.mentorProfile.delete({
      where: { userId },
    });
  }
}
