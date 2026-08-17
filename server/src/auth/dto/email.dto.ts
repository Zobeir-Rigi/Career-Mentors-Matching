import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email address to the user account.',
  })
  @IsEmail()
  email!: string;
}

export class ResendVerificationDto extends EmailDto {}

export class ForgotPasswordDto extends EmailDto {}
