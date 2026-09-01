import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ApprovalStatus } from '../../generated/prisma/enums';

export class UpdateMentorApprovalDto {
  @ApiProperty({
    enum: ApprovalStatus,
    example: ApprovalStatus.ACCEPTED,
  })
  @IsEnum(ApprovalStatus)
  approvalStatus!: ApprovalStatus;
}
