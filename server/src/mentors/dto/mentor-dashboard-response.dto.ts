import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    nullable: true,
    description: 'Short mentee focus/context shown on the mentor card.',
  })
  focus!: string | null;

  @ApiProperty({
    nullable: true,
    description:
      'Null until the mentee has accepted the proposal; visible from awaiting-booking onward.',
  })
  email!: string | null;
}

export class MentorDashboardCountdownDto {
  @ApiProperty({ nullable: true })
  daysLeft!: number | null;

  @ApiProperty({ nullable: true })
  expiresAt!: Date | null;
}

export class MentorDashboardEngagementDto {
  @ApiProperty()
  id!: string;

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

  @ApiProperty({ type: MentorDashboardMenteeDto })
  mentee!: MentorDashboardMenteeDto;

  @ApiProperty({ type: MentorDashboardCountdownDto })
  countdown!: MentorDashboardCountdownDto;
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

  @ApiProperty({ type: MentorDashboardCapacityDto })
  capacity!: MentorDashboardCapacityDto;

  @ApiProperty()
  isAcceptingMentees!: boolean;

  @ApiProperty({ type: [MentorDashboardEngagementDto] })
  engagements!: MentorDashboardEngagementDto[];

  @ApiProperty({ type: MentorDashboardProfileSummaryDto })
  profileSummary!: MentorDashboardProfileSummaryDto;
}
