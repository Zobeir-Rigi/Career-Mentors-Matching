import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMentorDto } from './create-mentor.dto';

export class UpdateMentorDto extends PartialType(CreateMentorDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Toggle mentor isAccepting mentees',
  })
  @IsOptional()
  @IsBoolean()
  isAcceptingMentees?: boolean;
}
