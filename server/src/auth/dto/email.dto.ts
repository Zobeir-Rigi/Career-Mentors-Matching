import { ApiProperty } from '@nestjs/swagger';
import { IsNormalisedEmail } from '../decorators/normalised-email-decorator';

export class EmailDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email address to the user account.',
  })
  @IsNormalisedEmail()
  email!: string;
}

export class ResendVerificationDto extends EmailDto {}

export class ForgotPasswordDto extends EmailDto {}
