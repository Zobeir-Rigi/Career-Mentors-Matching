import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenteeProfileResponseDto {
  @ApiPropertyOptional({
    example: 'Career Coach',
  })
  currentJobTitle?: string;

  @ApiPropertyOptional()
  reasonsNote?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  linkedinURL?: string;

  @ApiPropertyOptional()
  scheduleURL?: string;

  @ApiPropertyOptional()
  openToRemote?: boolean;

  @ApiPropertyOptional({
    example: 'MONTHLY',
  })
  meetingCadence?: string;

  @ApiPropertyOptional({
    example: 'OPEN',
  })
  meetingStructure?: string;

  @ApiProperty({
    example: false,
  })
  matchReady!: boolean;

  @ApiPropertyOptional({
    example: ['Technology & Telecoms', 'Finance & Insurance'],
  })
  industries?: string[];

  @ApiPropertyOptional({
    example: 'LONDON',
  })
  region?: string;

  @ApiPropertyOptional({
    example: ['WEEKDAY_EVENING', 'WEEKEND_MORNING'],
  })
  availability?: string[];

  @ApiPropertyOptional({
    example: ['Interview prep', 'Career advice'],
  })
  wantedSkills?: string[];

  @ApiPropertyOptional({
    example: ['Software Engineering', 'Data & Analytics'],
  })
  disciplineGoals?: string[];
}

// Used when the backend sends data back to the frontend.
// Response DTO (What the backend returns)
