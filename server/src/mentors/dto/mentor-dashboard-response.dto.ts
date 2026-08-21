import { ApiProperty } from '@nestjs/swagger';

import { MatchStatus } from '../../generated/prisma/enums';

export type MentorEngagementSubStatus =
  | 'proposed-awaiting-acceptance'
  | 'awaiting-booking'
  | 'booked'
  | 'confirmed-waiting'
  | 'active';

export class MentorDashboardMenteeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ nullable: true })
  currentJobTitle!: string | null;

  @ApiProperty({ nullable: true })
  bio!: string | null;

  @ApiProperty({ nullable: true })
  reasonsNote!: string | null;

  @ApiProperty({ type: [String] })
  goals!: string[];

  @ApiProperty({
    nullable: true,
    description:
      'Public LinkedIn profile shown while the mentor reviews the chemistry proposal.',
  })
  linkedinURL!: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Short mentee focus/context shown on the mentor card.',
  })
  focus!: string | null;

  @ApiProperty({
    nullable: true,
    description:
      'Private email hidden until the mentor accepts the chemistry proposal.',
  })
  email!: string | null;
}

export class MentorDashboardCountdownDto {
  @ApiProperty({ nullable: true })
  daysLeft!: number | null;

  @ApiProperty({ nullable: true })
  expiresAt!: Date | null;
}

export class MentorDashboardCheckInDto {
  @ApiProperty({ nullable: true })
  menteeAgreed!: boolean | null;

  @ApiProperty({ nullable: true })
  mentorAgreed!: boolean | null;
}

export class MentorDashboardEngagementDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MatchStatus })
  status!: MatchStatus;

  @ApiProperty({
    enum: [
      'proposed-awaiting-acceptance',
      'awaiting-booking',
      'booked',
      'confirmed-waiting',
      'active',
    ],
  })
  subStatus!: MentorEngagementSubStatus;

  @ApiProperty({
    type: MentorDashboardMenteeDto,
  })
  mentee!: MentorDashboardMenteeDto;

  @ApiProperty({
    type: MentorDashboardCountdownDto,
  })
  countdown!: MentorDashboardCountdownDto;

  @ApiProperty({
    type: MentorDashboardCheckInDto,
  })
  checkIn!: MentorDashboardCheckInDto;

  @ApiProperty({ nullable: true })
  chemistryBookedAt!: Date | null;

  @ApiProperty({ nullable: true })
  scheduledCheckIn!: Date | null;
}

export class MentorDashboardCapacityDto {
  @ApiProperty()
  filled!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  isAtCapacity!: boolean;
}

export class MentorDashboardProfileSummaryDto {
  @ApiProperty({ type: [String] })
  disciplines!: string[];

  @ApiProperty()
  bio!: string;
}

export class MentorDashboardResponseDto {
  @ApiProperty()
  fullName!: string;

  @ApiProperty({
    type: MentorDashboardCapacityDto,
  })
  capacity!: MentorDashboardCapacityDto;

  @ApiProperty()
  isAcceptingMentees!: boolean;

  @ApiProperty({
    type: [MentorDashboardEngagementDto],
  })
  engagements!: MentorDashboardEngagementDto[];

  @ApiProperty({
    type: MentorDashboardProfileSummaryDto,
  })
  profileSummary!: MentorDashboardProfileSummaryDto;
}
