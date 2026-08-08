import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import {
  Region,
  AvailabilityOption,
  MeetingCadence,
  MeetingStructure,
} from '../../generated/prisma/enums';
import { Transform } from 'class-transformer';

export class CreateMentorDto {
  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @IsNotEmpty()
  currentJobTitle!: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  capacity!: number;

  @ApiProperty({ enum: Region, example: Region.LONDON })
  @IsEnum(Region)
  region!: Region;

  @ApiProperty({ example: true })
  @IsBoolean()
  openToRemote!: boolean;

  @ApiProperty({
    enum: AvailabilityOption,
    isArray: true,
    example: [AvailabilityOption.WEEKDAY_EVENING],
  })
  @IsArray()
  @IsEnum(AvailabilityOption, { each: true })
  availability!: AvailabilityOption[];

  @ApiProperty({ enum: MeetingCadence, example: MeetingCadence.FORTNIGHTLY })
  @IsEnum(MeetingCadence)
  meetingCadence!: MeetingCadence;

  @ApiProperty({ enum: MeetingStructure, example: MeetingStructure.STRUCTURED })
  @IsEnum(MeetingStructure)
  meetingStructure!: MeetingStructure;

  @ApiProperty({ example: '10+ years experience in backend architecture' })
  @IsString()
  @IsNotEmpty()
  bio!: string;

  @ApiProperty({ example: 'https://linkedin.com/in/alexmorgan' })
  @IsUrl()
  @IsNotEmpty()
  linkedinURL!: string;

  @ApiPropertyOptional({ example: 'https://calendly.com/alexmorgan' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === ''
      ? undefined
      : (value as string),
  )
  @IsUrl({ require_protocol: false })
  scheduleURL?: string;

  @ApiPropertyOptional({ type: [String], example: ['Software Engineering'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disciplines!: string[];

  @ApiPropertyOptional({ type: [String], example: ['TypeScript', 'NestJS'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiPropertyOptional({ type: [String], example: ['Fintech'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries!: string[];
}
