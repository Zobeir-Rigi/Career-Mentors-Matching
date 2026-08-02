import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

// dto rejects a missing or empty token before the service runs
export class VerifyEmailDto {
  @ApiProperty({
    example: 'fd91e839...',
    description: 'The raw verification token from the email link.',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
