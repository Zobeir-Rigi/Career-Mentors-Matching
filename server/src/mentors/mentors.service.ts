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
} from '../generated/prisma/enums';

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
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.$transaction(async (tx) => {
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
      if (
        isComplete &&
        !updatedProfile.notifiedAdminAt &&
        updatedProfile.approvalStatus === 'PENDING'
      ) {
        const now = new Date();
        await tx.mentorProfile.update({
          where: { id: updatedProfile.id },
          data: { notifiedAdminAt: now },
        });
        updatedProfile.notifiedAdminAt = now;
      }

      return {
        ...updatedProfile,
        isProfileComplete: isComplete,
        isMatchReady: this.isMatchReady(updatedProfile),
      };
    });
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
    if (
      isComplete &&
      !profile.notifiedAdminAt &&
      profile.approvalStatus === 'PENDING'
    ) {
      const now = new Date();
      await this.prisma.mentorProfile.update({
        where: { id: profile.id },
        data: { notifiedAdminAt: now },
      });
      profile.notifiedAdminAt = now;
    }

    return {
      ...profile,
      isProfileComplete: isComplete,
      isMatchReady: this.isMatchReady(profile),
    };
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
