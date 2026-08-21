import { MatchStatus } from '@/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class StaffWaitingMenteeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: [String] })
  goals!: string[];

  @ApiProperty()
  waitingSince!: Date;
}

export class StaffMatchedPersonDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;
}

export class StaffMatchedPairDto {
  @ApiProperty()
  matchId!: string;

  @ApiProperty({ type: StaffMatchedPersonDto })
  mentee!: StaffMatchedPersonDto;

  @ApiProperty()
  mentor!: StaffMatchedPersonDto;

  @ApiProperty({ enum: MatchStatus })
  status!: MatchStatus;
}

export class StaffOverviewResponseDto {
  @ApiProperty()
  volunteerMentors!: number;

  @ApiProperty()
  openMenteePlaces!: number;

  @ApiProperty()
  liveMatches!: number;

  @ApiProperty()
  menteesWaiting!: number;

  @ApiProperty({ type: [StaffWaitingMenteeDto] })
  waitingMentees!: StaffWaitingMenteeDto[];

  @ApiProperty({ type: [StaffMatchedPairDto] })
  matchedPairs!: StaffMatchedPairDto[];

  @ApiProperty()
  pendingMentors!: number;
}
