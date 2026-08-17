import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenteeProfileResponseDto } from './dto/mentee-profile-response.dto';
import { UpdateMenteeProfileDto } from './dto/update-mentee-profile.dto';

@Injectable()
export class MenteeProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenteeProfile(userId: string): Promise<MenteeProfileResponseDto> {
    const profile = await this.prisma.menteeProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
        goalDisciplines: {
          include: {
            discipline: true,
          },
        },
        wantedSkills: {
          include: {
            skill: true,
          },
        },
        targetedIndustries: {
          include: {
            industry: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Mentee profile not found');
    }

    return {
      currentJobTitle: profile.currentJobTitle ?? undefined,
      reasonsNote: profile.reasonsNote ?? undefined,
      linkedinURL: profile.user?.linkedinURL ?? undefined,
      scheduleURL: profile.user?.scheduleURL ?? undefined,
      region: profile.region ?? undefined,
      openToRemote: profile.openToRemote,
      availability: profile.availability ?? [],
      meetingCadence: profile.meetingCadence ?? undefined,
      bio: profile.bio ?? undefined,
      meetingStructure: profile.meetingStructure ?? undefined,
      matchReady: this.isMatchReady(profile),

      disciplineGoals: profile.goalDisciplines.map(
        (item) => item.discipline.name,
      ),

      wantedSkills: profile.wantedSkills.map((item) => item.skill.name),

      industries: profile.targetedIndustries.map((item) => item.industry.name),
    };
  }

  async updateMenteeProfile(
    userId: string,
    updateMenteeProfileDto: UpdateMenteeProfileDto,
  ): Promise<MenteeProfileResponseDto> {
    const profile = await this.prisma.menteeProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
        goalDisciplines: {
          include: {
            discipline: true,
          },
        },
        wantedSkills: {
          include: {
            skill: true,
          },
        },
        targetedIndustries: {
          include: {
            industry: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Mentee profile not found');
    }

    const {
      linkedinURL,
      scheduleURL,
      wantedSkills,
      disciplineGoals,
      industries,
      ...profileData
    } = updateMenteeProfileDto;

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: profile.userId,
        },
        data: {
          ...(linkedinURL !== undefined && { linkedinURL }),
          ...(scheduleURL !== undefined && { scheduleURL }),
        },
      });

      await tx.menteeProfile.update({
        where: {
          id: profile.id,
        },
        data: {
          ...profileData,
        },
      });

      if (disciplineGoals !== undefined) {
        await tx.menteeGoalDisciplines.deleteMany({
          where: {
            menteeId: profile.id,
          },
        });

        if (disciplineGoals.length > 0) {
          const disciplineRecords = await Promise.all(
            disciplineGoals.map((name) =>
              tx.discipline.upsert({
                where: { name },
                create: { name },
                update: {},
              }),
            ),
          );

          await tx.menteeGoalDisciplines.createMany({
            data: disciplineRecords.map((discipline) => ({
              menteeId: profile.id,
              disciplineId: discipline.id,
            })),
          });
        }
      }

      if (wantedSkills !== undefined) {
        await tx.menteeWantedSkills.deleteMany({
          where: {
            menteeId: profile.id,
          },
        });

        if (wantedSkills.length > 0) {
          const skillRecords = await Promise.all(
            wantedSkills.map((name) =>
              tx.skill.upsert({
                where: { name },
                create: { name },
                update: {},
              }),
            ),
          );

          await tx.menteeWantedSkills.createMany({
            data: skillRecords.map((skill) => ({
              menteeId: profile.id,
              skillId: skill.id,
            })),
          });
        }
      }
      if (industries !== undefined) {
        await tx.menteeTargetedIndustries.deleteMany({
          where: {
            menteeId: profile.id,
          },
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

          await tx.menteeTargetedIndustries.createMany({
            data: industryRecords.map((industry) => ({
              menteeId: profile.id,
              industryId: industry.id,
            })),
          });
        }
      }

      const finalProfile = await tx.menteeProfile.findUnique({
        where: {
          id: profile.id,
        },
        include: {
          user: true,
          goalDisciplines: {
            include: {
              discipline: true,
            },
          },
          wantedSkills: {
            include: {
              skill: true,
            },
          },
          targetedIndustries: {
            include: {
              industry: true,
            },
          },
        },
      });

      if (!finalProfile) {
        throw new NotFoundException('Failed to retrieve updated profile');
      }

      return {
        currentJobTitle: finalProfile.currentJobTitle ?? undefined,
        reasonsNote: finalProfile.reasonsNote ?? undefined,
        bio: finalProfile.bio ?? undefined,
        linkedinURL: finalProfile.user?.linkedinURL ?? undefined,
        scheduleURL: finalProfile.user?.scheduleURL ?? undefined,
        openToRemote: finalProfile.openToRemote,
        region: finalProfile.region ?? undefined,
        availability: finalProfile.availability ?? [],
        meetingCadence: finalProfile.meetingCadence ?? undefined,
        meetingStructure: finalProfile.meetingStructure ?? undefined,
        matchReady: this.isMatchReady(finalProfile),

        disciplineGoals: finalProfile.goalDisciplines.map(
          (item) => item.discipline.name,
        ),

        wantedSkills: finalProfile.wantedSkills.map((item) => item.skill.name),

        industries: finalProfile.targetedIndustries.map(
          (item) => item.industry.name,
        ),
      };
    });
  }

  private isMatchReady(profile: {
    region: unknown;
    availability: readonly unknown[];
    meetingCadence: unknown;
    meetingStructure: unknown;
    goalDisciplines: readonly unknown[];
    wantedSkills: readonly unknown[];
    targetedIndustries: readonly unknown[];
  }): boolean {
    return Boolean(
      profile.region &&
      profile.availability.length > 0 &&
      profile.goalDisciplines.length > 0 &&
      profile.wantedSkills.length > 0 &&
      profile.targetedIndustries.length > 0 &&
      profile.meetingCadence &&
      profile.meetingStructure,
    );
  }
}
