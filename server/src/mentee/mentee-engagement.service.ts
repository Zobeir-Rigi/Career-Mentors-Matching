import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';

@Injectable()
export class MenteeEngagementService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOwnedEngagement(userId: string, engagementId: string) {
    const engagement = await this.prisma.matches.findFirst({
      where: {
        id: engagementId,
        menteeProfile: {
          userId,
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException('Mentee engagement not found');
    }

    return engagement;
  }

  async bookChemistry(userId: string, engagementId: string) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.chemistryBookedAt) {
      return engagement;
    }

    if (engagement.status === MatchStatus.DECLINED) {
      throw new ConflictException(
        'A declined engagement cannot book a chemistry session.',
      );
    }

    if (engagement.status === MatchStatus.COMPLETED) {
      throw new ConflictException(
        'A completed mentorship cannot book a chemistry session.',
      );
    }

    if (engagement.status === MatchStatus.ACTIVE) {
      return engagement;
    }

    if (engagement.status !== MatchStatus.CHEMISTRY_CONFIRMED) {
      throw new ConflictException(
        'The mentor must accept the chemistry proposal before the session can be booked.',
      );
    }

    if (!engagement.menteeAcceptedAt) {
      throw new ConflictException(
        'The mentee must accept the proposal before booking the chemistry session.',
      );
    }

    return this.prisma.matches.update({
      where: {
        id: engagement.id,
      },
      data: {
        chemistryBookedAt: new Date(),
      },
    });
  }

  async respondToCheckIn(
    userId: string,
    engagementId: string,
    agreed: boolean,
  ) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.status !== MatchStatus.MATCH_PENDING) {
      throw new ConflictException(
        'Check-in response can only be submitted while mentorship confirmation is pending.',
      );
    }

    if (engagement.checkInMenteeAgreed !== null) {
      return engagement;
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      if (!agreed) {
        return tx.matches.update({
          where: {
            id: engagement.id,
          },
          data: {
            checkInMenteeAgreed: false,
            status: MatchStatus.DECLINED,
            declinedAt: now,
            checkInExpiresAt: null,
          },
        });
      }

      await tx.matches.update({
        where: {
          id: engagement.id,
        },
        data: {
          checkInMenteeAgreed: true,
        },
      });

      await tx.matches.updateMany({
        where: {
          id: engagement.id,
          status: MatchStatus.MATCH_PENDING,
          checkInMenteeAgreed: true,
          checkInMentorAgreed: true,
        },
        data: {
          status: MatchStatus.ACTIVE,
          checkInExpiresAt: null,
        },
      });

      return tx.matches.findUniqueOrThrow({
        where: {
          id: engagement.id,
        },
      });
    });
  }

  async decline(userId: string, engagementId: string) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.status === MatchStatus.DECLINED) {
      return engagement;
    }

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

  async end(userId: string, engagementId: string) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.status === MatchStatus.COMPLETED) {
      return engagement;
    }

    if (engagement.status === MatchStatus.DECLINED) {
      throw new ConflictException('A declined engagement cannot be ended.');
    }

    if (engagement.status !== MatchStatus.ACTIVE) {
      throw new ConflictException('Only an active mentorship can be ended.');
    }

    return this.prisma.matches.update({
      where: {
        id: engagement.id,
      },
      data: {
        status: MatchStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }
}
