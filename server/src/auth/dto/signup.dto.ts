import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

// Exclude Admin user type for registration.
export enum PublicSignupRole {
  MENTEE = 'MENTEE',
  MENTOR = 'MENTOR',
}

// Validate input data.
export class SignupDto {
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
    example: 'Password123!',
    minLength: 8,
    description:
      'The account password must contain at least 8 characters, an uppercase, a lowercase, a number, and a special character',
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

  @ApiProperty({
    enum: PublicSignupRole,
    example: PublicSignupRole.MENTEE,
    description: 'Public signup supports mentee and mentor accounts only.',
  })
  @IsEnum(PublicSignupRole)
  role!: PublicSignupRole;
}
