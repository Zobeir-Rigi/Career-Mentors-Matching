import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { PasswordDto } from './password.dto';

export class ResetPasswordDto extends PasswordDto {
  @ApiProperty({
    description: 'Password reset token received by email.',
  })
  @IsString()
  token!: string;
}
