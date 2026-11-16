import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus } from '../generated/prisma/enums';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MenteeEngagementService {
  // Nest supplies MailService for mentorship notifications.
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private async findOwnedEngagement(userId: string, engagementId: string) {
    const engagement = await this.prisma.matches.findFirst({
      where: {
        id: engagementId,
        menteeProfile: {
          userId,
        },
      },
      // Load both participants' contact details for mentorship notifications.
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

    const result = await this.prisma.$transaction(async (tx) => {
      if (!agreed) {
        const updatedEngagement = await tx.matches.update({
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

        return {
          updatedEngagement,
          becameActive: false,
        };
      }

      await tx.matches.update({
        where: {
          id: engagement.id,
        },
        data: {
          checkInMenteeAgreed: true,
        },
      });

      const activation = await tx.matches.updateMany({
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

      const updatedEngagement = await tx.matches.findUniqueOrThrow({
        where: {
          id: engagement.id,
        },
      });

      return {
        updatedEngagement,
        becameActive: activation.count === 1,
      };
    });

    // Notify both participants after this request commits the activation.
    if (result.becameActive) {
      await this.mailService.notifyMentorshipStarted({
        mentor: {
          email: engagement.mentorProfile.user.email,
          fullName: engagement.mentorProfile.user.fullName,
        },
        mentee: {
          email: engagement.menteeProfile.user.email,
          fullName: engagement.menteeProfile.user.fullName,
        },
      });
    }

    return result.updatedEngagement;
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
