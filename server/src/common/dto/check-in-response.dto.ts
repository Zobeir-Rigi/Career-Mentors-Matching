import { IsBoolean } from 'class-validator';

export class CheckInResponseDto {
  @IsBoolean()
  agreed!: boolean;
}
