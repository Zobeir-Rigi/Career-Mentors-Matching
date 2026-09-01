import { MatchStatus } from '@/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class AdminWaitingMenteeDto {
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

export class AdminMatchedPersonDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;
}

export class AdminMatchedPairDto {
  @ApiProperty()
  matchId!: string;

  @ApiProperty({ type: AdminMatchedPersonDto })
  mentee!: AdminMatchedPersonDto;

  @ApiProperty()
  mentor!: AdminMatchedPersonDto;

  @ApiProperty({ enum: MatchStatus })
  status!: MatchStatus;
}

export class AdminOverviewResponseDto {
  @ApiProperty()
  volunteerMentors!: number;

  @ApiProperty()
  openMenteePlaces!: number;

  @ApiProperty()
  liveMatches!: number;

  @ApiProperty()
  menteesWaiting!: number;

  @ApiProperty({ type: [AdminWaitingMenteeDto] })
  waitingMentees!: AdminWaitingMenteeDto[];

  @ApiProperty({ type: [AdminMatchedPairDto] })
  matchedPairs!: AdminMatchedPairDto[];

  @ApiProperty()
  pendingMentors!: number;
}
