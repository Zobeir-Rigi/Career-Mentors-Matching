import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { StaffMentorsResponseDto } from './dto/staff-mentors-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class StaffService {
    private readonly logger = new Logger(StaffService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getMentors(): Promise<StaffMentorsResponseDto> {
        try {
            const mentors = await this.prisma.mentorProfile.findMany({
                select: {
                    user: {
                        select: {
                            fullName: true,
                            role: true,
                            email: true,
                            createdAt: true,
                            linkedinURL: true,
                        },
                    },
                    matches: {
                        select: {
                            id: true,
                            status: true,
                            scores: true,
                            createdAt: true,
                            declinedAt: true,
                            menteeProfile: {
                                select: {
                                    user: {
                                        select: {
                                            fullName: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    bio: true,
                    capacity: true,
                    region: true,
                    availability: true,
                    mentorDisciplines: {
                        select: {
                            discipline: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!mentors || mentors.length === 0) {
                return plainToInstance(StaffMentorsResponseDto, { mentors: [] });
            }

            const mentorsData = mentors.map((mentor) => {
                const user = mentor?.user;
                const matches = Array.isArray(mentor?.matches) ? mentor.matches : [];
                const mentorDisciplines = Array.isArray(mentor?.mentorDisciplines)
                    ? mentor.mentorDisciplines
                    : [];

                return {
                    fullName: user?.fullName ?? '',
                    disciplines: mentorDisciplines
                        .map((md) => md?.discipline?.name)
                        .filter((name): name is string => Boolean(name)),
                    role: user?.role ?? null,
                    email: user?.email ?? '',
                    bio: mentor?.bio ?? '',
                    capacity: mentor?.capacity ?? 0,
                    region: mentor?.region ?? null,
                    availability: mentor?.availability ?? false,
                    createdAt: user?.createdAt ?? null,
                    links: user?.linkedinURL ?? null,
                    matches: matches.map((match) => ({
                        status: match?.status ?? null,
                        score: match?.scores ?? null,
                        fullName: match?.menteeProfile?.user?.fullName ?? '',
                        createdAt: match?.createdAt ?? null,
                        declinedAt: match?.declinedAt ?? null,
                    })),
                };
            });

            return plainToInstance(StaffMentorsResponseDto, {
                mentors: mentorsData,
            });
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while fetching mentors');
        }
    }
}