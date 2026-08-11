import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { AvailabilityOptions } from '../enums/availability-options.enum';
import { MeetingCadence } from '../enums/meeting-cadence.enum';
import { MeetingStructure } from '../enums/meeting-structure.enum';
import { Region } from '../enums/region.enum';

export class UpdateMenteeProfileDto {
  @ApiPropertyOptional({
    example: 'Career',
  })
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsOptional()
  @IsString()
  currentJobTitle?: string;

  @ApiPropertyOptional({
    example: 'I want help transitioning into tech.',
  })
  @IsOptional()
  @IsString()
  reasonsNote?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  openToRemote?: boolean;

  @ApiPropertyOptional({
    example: 'https://linkedin.com/in/johndoe',
  })
  @IsOptional()
  @IsUrl()
  linkedinURL?: string;

  @ApiPropertyOptional({
    example: 'https://calendly.com/johndoe',
  })
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsOptional()
  @IsUrl()
  scheduleURL?: string;

  @ApiPropertyOptional({
    enum: Region,
    example: Region.LONDON,
  })
  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @ApiPropertyOptional({
    enum: AvailabilityOptions,
    isArray: true,
    example: [
      AvailabilityOptions.WEEKDAY_EVENING,
      AvailabilityOptions.WEEKEND_MORNING,
    ],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AvailabilityOptions, { each: true })
  availability?: AvailabilityOptions[];

  @ApiPropertyOptional({
    enum: MeetingCadence,
    example: MeetingCadence.FORTNIGHTLY,
  })
  @IsOptional()
  @IsEnum(MeetingCadence)
  meetingCadence?: MeetingCadence;

  @ApiPropertyOptional({
    enum: MeetingStructure,
    example: MeetingStructure.STRUCTURED,
  })
  @IsOptional()
  @IsEnum(MeetingStructure)
  meetingStructure?: MeetingStructure;

  @ApiPropertyOptional({
    example: ['Software Engineering', 'Data & Analytics'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disciplineGoals?: string[];

  @ApiPropertyOptional({
    example: ['Interview prep', 'Career advice'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wantedSkills?: string[];

  @ApiPropertyOptional({
    example: 'Anything my mentor should know about me.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: ['Technology & Telecoms', 'Finance & Insurance'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];
}
