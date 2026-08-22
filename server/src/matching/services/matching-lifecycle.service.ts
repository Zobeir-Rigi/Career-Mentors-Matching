import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MatchStatus } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';

const CHECK_IN_RESPONSE_DAYS = 7;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

@Injectable()
export class MatchingLifecycleService {
  private readonly logger = new Logger(MatchingLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processDueCheckIns(): Promise<void> {
    const now = new Date();

    const dueMatches = await this.prisma.matches.findMany({
      where: {
        status: MatchStatus.CHEMISTRY_CONFIRMED,
        scheduledCheckIn: {
          lte: now,
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
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    for (const match of dueMatches) {
      const checkInExpiresAt = new Date(
        now.getTime() + CHECK_IN_RESPONSE_DAYS * MILLISECONDS_PER_DAY,
      );

      const transition = await this.prisma.matches.updateMany({
        where: {
          id: match.id,
          status: MatchStatus.CHEMISTRY_CONFIRMED,
          scheduledCheckIn: {
            lte: now,
          },
        },
        data: {
          status: MatchStatus.MATCH_PENDING,
          checkInExpiresAt,
        },
      });

      if (transition.count === 0) {
        continue;
      }

      await this.sendCheckInEmail({
        matchId: match.id,
        email: match.menteeProfile.user.email,
        fullName: match.menteeProfile.user.fullName,
        counterpartFullName: match.mentorProfile.user.fullName,
        recipientRole: 'mentee',
      });

      await this.sendCheckInEmail({
        matchId: match.id,
        email: match.mentorProfile.user.email,
        fullName: match.mentorProfile.user.fullName,
        counterpartFullName: match.menteeProfile.user.fullName,
        recipientRole: 'mentor',
      });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processExpiredChemistryProposals(): Promise<void> {
    const now = new Date();

    const expiredMatches = await this.prisma.matches.findMany({
      where: {
        status: MatchStatus.CHEMISTRY_PENDING,
        proposalExpiresAt: {
          lte: now,
        },
      },
      select: {
        id: true,
      },
    });

    for (const match of expiredMatches) {
      await this.prisma.matches.updateMany({
        where: {
          id: match.id,
          status: MatchStatus.CHEMISTRY_PENDING,
          proposalExpiresAt: {
            lte: now,
          },
        },
        data: {
          status: MatchStatus.DECLINED,
          declinedAt: now,
          proposalExpiresAt: null,
        },
      });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processExpiredCheckIns(): Promise<void> {
    const now = new Date();

    const expiredMatches = await this.prisma.matches.findMany({
      where: {
        status: MatchStatus.MATCH_PENDING,
        checkInExpiresAt: {
          lte: now,
        },
        OR: [
          {
            checkInMenteeAgreed: null,
          },
          {
            checkInMentorAgreed: null,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    for (const match of expiredMatches) {
      await this.prisma.matches.updateMany({
        where: {
          id: match.id,
          status: MatchStatus.MATCH_PENDING,
          checkInExpiresAt: {
            lte: now,
          },
          OR: [
            {
              checkInMenteeAgreed: null,
            },
            {
              checkInMentorAgreed: null,
            },
          ],
        },
        data: {
          status: MatchStatus.DECLINED,
          declinedAt: now,
          checkInExpiresAt: null,
        },
      });
    }
  }

  private async sendCheckInEmail({
    matchId,
    email,
    fullName,
    counterpartFullName,
    recipientRole,
  }: {
    matchId: string;
    email: string;
    fullName: string;
    counterpartFullName: string;
    recipientRole: 'mentor' | 'mentee';
  }): Promise<void> {
    try {
      await this.mailService.sendMentorshipCheckInEmail({
        email,
        fullName,
        counterpartFullName,
        recipientRole,
      });
    } catch (error) {
      this.logger.error(
        `Check-in email could not be sent for match ${matchId} to ${recipientRole}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
