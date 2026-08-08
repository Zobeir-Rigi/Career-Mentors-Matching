import { ApiProperty } from '@nestjs/swagger';
import {
  Region,
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
  ApprovalStatus,
} from '../../generated/prisma/enums';

export class MentorProfileResponseDto {
  @ApiProperty({ example: 'profile-uuid-9876' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ example: 'Senior Backend Engineer', nullable: true })
  currentJobTitle!: string | null;

  @ApiProperty({ example: 3 })
  capacity!: number;

  @ApiProperty({ enum: Region, nullable: true })
  region!: Region | null;

  @ApiProperty({ example: true })
  openToRemote!: boolean;

  @ApiProperty({ enum: AvailabilityOption, isArray: true })
  availability!: AvailabilityOption[];

  @ApiProperty({ enum: MeetingCadence, nullable: true })
  meetingCadence!: MeetingCadence | null;

  @ApiProperty({ enum: MeetingStructure, nullable: true })
  meetingStructure!: MeetingStructure | null;

  @ApiProperty({ example: '10+ years in Node.js', nullable: true })
  bio!: string | null;

  @ApiProperty({ example: false })
  isAcceptingMentees!: boolean;

  @ApiProperty({ enum: ApprovalStatus })
  approvalStatus!: ApprovalStatus;

  @ApiProperty({ example: null, nullable: true })
  notifiedAdminAt!: Date | null;

  @ApiProperty({
    description:
      'Calculated flag indicating if mandatory profile fields are complete',
    example: true,
  })
  isProfileComplete!: boolean;

  @ApiProperty({
    description:
      'Calculated flag indicating if the mentor is ready for matching',
    example: false,
  })
  isMatchReady!: boolean;
}
