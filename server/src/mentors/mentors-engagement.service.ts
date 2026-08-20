import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';

@Injectable()
export class MentorEngagementService {
  constructor(private readonly prisma: PrismaService) {}

  //   Mentor only gets access to their dashboard
  private async findOwnedEngagement(userId: string, engagementId: string) {
    const engagement = await this.prisma.matches.findFirst({
      where: {
        id: engagementId,
        mentorProfile: {
          userId,
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

    return this.prisma.matches.update({
      where: {
        id: engagement.id,
      },
      data: {
        status: MatchStatus.DECLINED,
        declinedAt: new Date(),
      },
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

    return this.prisma.matches.update({
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
