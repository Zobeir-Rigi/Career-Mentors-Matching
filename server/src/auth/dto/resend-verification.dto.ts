import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email address to resend verification to.',
  })
  @IsEmail()
  email!: string;
}
