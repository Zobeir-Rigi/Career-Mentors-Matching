import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsNormalisedEmail } from '../decorators/normalised-email-decorator';

// Validate login data input
export class LoginDto {
  @ApiProperty({
    example: 'test@example.com',
  })
  @IsNormalisedEmail()
  email!: string;

  @ApiProperty({
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
