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

  async accept(userId: string, engagementId: string) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.menteeAcceptedAt) {
      return engagement;
    }

    if (engagement.status === MatchStatus.DECLINED) {
      throw new ConflictException('A declined engagement cannot be accepted.');
    }

    if (engagement.status === MatchStatus.COMPLETED) {
      throw new ConflictException('A completed mentorship cannot be accepted.');
    }

    if (engagement.status === MatchStatus.ACTIVE) {
      return engagement;
    }

    return this.prisma.matches.update({
      where: {
        id: engagement.id,
      },
      data: {
        menteeAcceptedAt: new Date(),
      },
    });
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

  async confirm(userId: string, engagementId: string) {
    const engagement = await this.findOwnedEngagement(userId, engagementId);

    if (engagement.chemistryMenteeConfirmedAt) {
      return engagement;
    }

    if (engagement.status === MatchStatus.DECLINED) {
      throw new ConflictException('A declined engagement cannot be confirmed.');
    }

    if (engagement.status === MatchStatus.COMPLETED) {
      throw new ConflictException(
        'A completed mentorship cannot be confirmed.',
      );
    }

    if (engagement.status === MatchStatus.ACTIVE) {
      return engagement;
    }

    if (!engagement.menteeAcceptedAt) {
      throw new ConflictException(
        'The proposal must be accepted before mentorship can be confirmed.',
      );
    }

    if (!engagement.chemistryBookedAt) {
      throw new ConflictException(
        'The chemistry meeting must be booked before mentorship can be confirmed.',
      );
    }

    const now = new Date();

    const bothConfirmed = Boolean(engagement.chemistryMentorConfirmedAt);

    return this.prisma.matches.update({
      where: {
        id: engagement.id,
      },
      data: {
        chemistryMenteeConfirmedAt: now,

        ...(bothConfirmed && {
          status: MatchStatus.ACTIVE,
        }),
      },
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
