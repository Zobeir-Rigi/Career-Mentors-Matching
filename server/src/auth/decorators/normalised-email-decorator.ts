import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export function IsNormalisedEmail() {
  return applyDecorators(
    Transform(({ value }) => {
      return typeof value === 'string' ? value.trim().toLowerCase() : '';
    }),
    IsEmail(),
  );
}
