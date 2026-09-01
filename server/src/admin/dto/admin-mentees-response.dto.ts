import { ApiProperty } from '@nestjs/swagger';
import { Region, AvailabilityOption } from '../../generated/prisma/enums';

export class MenteeMatchDto {
  @ApiProperty({
    example: 'ACTIVE',
    enum: ['CHEMISTRY_PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED'],
  })
  status!: string;

  @ApiProperty({ example: 90.2 })
  score!: number;

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string;

  @ApiProperty({ example: '2026-08-16T23:31:51.512Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-16T23:31:51.512Z' })
  declinedAt!: string;
}

export class AdminMenteeMentorDto {
  @ApiProperty()
  mentorProfileId!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;
}

export class AdminMenteeDto {
  @ApiProperty()
  menteeProfileId!: string;

  @ApiProperty({
    description: 'Full name of the mentor',
    example: 'Ruta Radiya',
  })
  fullName!: string;
  @ApiProperty({ type: [String], example: ['Software Engineering'] })
  goals!: string[];

  @ApiProperty({
    description: 'Role of the user',
    example: 'MENTOR',
  })
  role!: string;
  @ApiProperty({
    description: 'Mentors email',
    example: 'ruta.radiya@mentor.example.dev',
  })
  email!: string;
  @ApiProperty({ example: 3 })
  capacity!: number;
  @ApiProperty({ enum: Region, example: Region.LONDON })
  region!: Region;
  @ApiProperty({
    example:
      'Full stack developer - 15 years of experience. Also. experienced in people coaching/mentoring.',
  })
  bio!: string;
  @ApiProperty({ example: '2026-08-16T21:49:39.650Z' })
  createdAt!: string;
  @ApiProperty({
    enum: AvailabilityOption,
    isArray: true,
    example: [AvailabilityOption.WEEKDAY_EVENING],
  })
  availability!: AvailabilityOption[];

  @ApiProperty({ example: 'https://www.linkedin.com/' })
  links!: string;

  matches!: MenteeMatchDto[];

  @ApiProperty({
    type: AdminMenteeMentorDto,
    nullable: true,
  })
  mentor!: AdminMenteeMentorDto | null;

  @ApiProperty({
    nullable: true,
    description: 'Current match status',
  })
  status!: string | null;
}

export class AdminMenteesResponseDto {
  @ApiProperty({
    type: [AdminMenteeDto],
    description: 'List of mentee profiles',
  })
  mentees!: AdminMenteeDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
