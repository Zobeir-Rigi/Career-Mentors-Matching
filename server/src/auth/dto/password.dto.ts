import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class PasswordDto {
  @ApiProperty({
    example: 'Password123!',
    minLength: 8,
    description:
      'The password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character',
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?`~]).+$/,
    {
      message:
        'Password must include an uppercase letter, a lowercase letter, a number, and a special character.',
    },
  )
  password!: string;
}
