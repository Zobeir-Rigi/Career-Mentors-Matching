import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';

import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus, WaitingStatus } from '../generated/prisma/enums';

@Injectable()
export class MentorEngagementService {
  private readonly logger = new Logger(MentorEngagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  //   Mentor only gets access to their dashboard
  private async findOwnedEngagement(userId: string, engagementId: string) {
    const engagement = await this.prisma.matches.findFirst({
      where: {
        id: engagementId,
        mentorProfile: {
          userId,
        },
      },
      include: {
        menteeProfile: {
          include: {
            user: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
        mentorProfile: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException('Mentor engagement not found');
    }
    return engagement;
  }

  async decline(userId: string, engagementId: string) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.status === MatchStatus.DECLINED) return engagement;

    if (engagement.status === MatchStatus.ACTIVE) {
      throw new ConflictException(
        'Active mentorship cannot be declined. End the mentorship instead.',
      );
    }

    if (engagement.status === MatchStatus.COMPLETED) {
      throw new ConflictException('Completed mentorship cannot be declined.');
    }

    return this.prisma.$transaction(async (tx) => {
      const declinedEngagement = await tx.matches.update({
        where: {
          id: engagement.id,
        },
        data: {
          status: MatchStatus.DECLINED,
          declinedAt: new Date(),
        },
      });

      await tx.menteeWaitingList.upsert({
        where: {
          menteeId: engagement.menteeId,
        },
        update: {
          status: WaitingStatus.WAITING,
        },
        create: {
          menteeId: engagement.menteeId,
          status: WaitingStatus.WAITING,
        },
      });

      return declinedEngagement;
    });
  }

  async confirm(userId: string, engagementId: string) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.chemistryMentorConfirmedAt) return engagement;

    if (engagement.status === MatchStatus.DECLINED) {
      throw new ConflictException('A declined engagement cannot be confirmed');
    }

    if (engagement.status === MatchStatus.COMPLETED) {
      throw new ConflictException('A completed mentorship cannot be confirmed');
    }

    if (engagement.status === MatchStatus.ACTIVE) return engagement;

    if (!engagement.menteeAcceptedAt) {
      throw new ConflictException(
        'The mentee must accept the proposal before mentorship can be confirmed.',
      );
    }

    const now = new Date();

    const scheduledCheckIn = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const confirmedEngagement = await this.prisma.matches.update({
      where: {
        id: engagement.id,
      },
      data: {
        status: MatchStatus.CHEMISTRY_CONFIRMED,
        chemistryMentorConfirmedAt: now,
        scheduledCheckIn,
        proposalExpiresAt: null,
      },
    });

    try {
      await this.mailService.sendChemistryAcceptedEmail({
        email: engagement.menteeProfile.user.email,
        menteeFullName: engagement.menteeProfile.user.fullName,
        mentorFullName: engagement.mentorProfile.user.fullName,
      });
    } catch (error) {
      this.logger.error(
        `Chemistry accepted email could not be sent for match ${engagement.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return confirmedEngagement;
  }

  async end(userId: string, engagementId: string) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.status === MatchStatus.COMPLETED) return engagement;

    if (engagement.status === MatchStatus.DECLINED) {
      throw new ConflictException('A declined engagement cannot be ended.');
    }

    if (engagement.status !== MatchStatus.ACTIVE) {
      throw new ConflictException('Only an active mentorship can be ended.');
    }

    const now = new Date();

    return this.prisma.matches.update({
      where: {
        id: engagement.id,
      },
      data: {
        status: MatchStatus.COMPLETED,
        completedAt: now,
      },
    });
  }
}
