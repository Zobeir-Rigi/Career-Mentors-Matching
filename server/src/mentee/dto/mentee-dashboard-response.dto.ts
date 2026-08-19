import { ApiProperty } from '@nestjs/swagger';

import { MatchStatus } from '../../generated/prisma/enums';

export type MenteeJourneyStage =
  | 'incomplete'
  | 'ready'
  | 'match-proposed'
  | 'chemistry-confirm'
  | 'mentorship-active';

export type MenteeMatchSubStatus =
  'proposed' | 'awaiting-booking' | 'booked' | 'confirmed-waiting' | 'active';

export class MenteeDashboardMentorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ nullable: true })
  currentJobTitle!: string | null;

  @ApiProperty({ nullable: true })
  bio!: string | null;

  @ApiProperty({ nullable: true })
  linkedinURL!: string | null;

  @ApiProperty({ nullable: true })
  calendarLink!: string | null;

  @ApiProperty({
    type: [String],
    description: 'Mentor focus areas shown on the mentee match card.',
  })
  focusAreas!: string[];

  @ApiProperty({
    nullable: true,
    description:
      "Mentor email exposed only for the mentee's own current engagement.",
  })
  email!: string | null;
}

export class MenteeDashboardCountdownDto {
  @ApiProperty({ nullable: true })
  daysLeft!: number | null;

  @ApiProperty({ nullable: true })
  expiresAt!: Date | null;
}

export class MenteeDashboardCurrentMatchDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    enum: [
      'proposed',
      'awaiting-booking',
      'booked',
      'confirmed-waiting',
      'active',
    ],
  })
  subStatus!: MenteeMatchSubStatus;

  @ApiProperty({ type: MenteeDashboardMentorDto })
  mentor!: MenteeDashboardMentorDto;

  @ApiProperty({ type: MenteeDashboardCountdownDto })
  countdown!: MenteeDashboardCountdownDto;

  @ApiProperty({ nullable: true })
  chemistryBookedAt!: Date | null;
}

export class MenteeDashboardPastMatchDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  mentorName!: string;

  @ApiProperty({ type: [String] })
  focusAreas!: string[];

  @ApiProperty({ enum: MatchStatus })
  status!: MatchStatus;

  @ApiProperty({ nullable: true })
  completedAt!: Date | null;

  @ApiProperty({ nullable: true })
  declinedAt!: Date | null;
}

export class MenteeDashboardResponseDto {
  @ApiProperty()
  fullName!: string;

  @ApiProperty({
    enum: [
      'incomplete',
      'ready',
      'match-proposed',
      'chemistry-confirm',
      'mentorship-active',
    ],
  })
  journeyStage!: MenteeJourneyStage;

  @ApiProperty()
  matchReady!: boolean;

  @ApiProperty({ type: [String] })
  goals!: string[];

  @ApiProperty({
    type: MenteeDashboardCurrentMatchDto,
    nullable: true,
  })
  currentMatch!: MenteeDashboardCurrentMatchDto | null;

  @ApiProperty({
    type: [MenteeDashboardPastMatchDto],
  })
  pastMatches!: MenteeDashboardPastMatchDto[];
}
