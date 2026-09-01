import { ApiProperty } from '@nestjs/swagger';
import {
  Region,
  AvailabilityOption,
  ApprovalStatus,
  MatchStatus,
} from '../../generated/prisma/enums';

export class AdminMatchedMenteeDto {
  @ApiProperty()
  menteeProfileId!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({
    description: 'Matching score for this mentor-mentee relationship',
    example: 92.5,
  })
  score!: number;
}

export class AdminMentorCapacityDto {
  @ApiProperty({
    description: 'Number of current capacity-relevant mentorship',
    example: 1,
  })
  filled!: number;

  @ApiProperty({
    description: 'Maximum number of mentees this mentor can take',
    example: 3,
  })
  total!: number;

  @ApiProperty({
    description: 'Whether the mentor has reached their capacity',
    example: false,
  })
  isFull!: boolean;
}

export class MentorMatchDto {
  @ApiProperty({
    enum: { MatchStatus },
  })
  status!: MatchStatus;

  @ApiProperty({ example: 90.2 })
  score!: number;

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string;

  @ApiProperty({ example: '2026-08-16T23:31:51.512Z' })
  createdAt!: Date;

  @ApiProperty({ nullable: true, example: '2026-08-16T23:31:51.512Z' })
  declinedAt!: Date | null;
}

export class AdminMentorDto {
  @ApiProperty()
  mentorProfileId!: string;

  @ApiProperty({
    description: 'Full name of the mentor',
    example: 'Ruta Radiya',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Mentor email address',
    example: 'ruta.radiya@mentor.example.dev',
  })
  email!: string;

  @ApiProperty({
    nullable: true,
    example: 'Senior Software Engineer',
  })
  currentJobTitle!: string | null;

  @ApiProperty({
    enum: ApprovalStatus,
    example: ApprovalStatus.ACCEPTED,
  })
  approvalStatus!: ApprovalStatus;

  @ApiProperty({ type: [String], example: ['Software Engineering'] })
  disciplines!: string[];

  @ApiProperty({ type: AdminMentorCapacityDto })
  capacity!: AdminMentorCapacityDto;

  @ApiProperty({ enum: Region, nullable: true })
  region!: Region | null;

  @ApiProperty({
    enum: AvailabilityOption,
    isArray: true,
  })
  availability!: AvailabilityOption[];

  @ApiProperty({ nullable: true })
  bio!: string | null;

  @ApiProperty({ nullable: true })
  linkedinURL!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({
    type: [MentorMatchDto],
  })
  matches!: MentorMatchDto[];
}

export class AdminMentorsResponseDto {
  @ApiProperty({
    type: [AdminMentorDto],
    description: 'List of mentor profiles',
  })
  mentors!: AdminMentorDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
