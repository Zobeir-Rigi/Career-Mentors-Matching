import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { PasswordDto } from './password.dto';

// Exclude Admin user type for registration.
export enum PublicSignupRole {
  MENTEE = 'MENTEE',
  MENTOR = 'MENTOR',
}

// Validate input data.
export class SignupDto extends PasswordDto {
  @ApiProperty({
    example: 'Jane Doe',
    description: "The user's full name",
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'A valid and unique email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: PublicSignupRole,
    example: PublicSignupRole.MENTEE,
    description: 'Public signup supports mentee and mentor accounts only.',
  })
  @IsEnum(PublicSignupRole)
  role!: PublicSignupRole;
}
