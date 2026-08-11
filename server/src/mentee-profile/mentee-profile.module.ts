import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MenteeProfileController } from './mentee-profile.controller';
import { MenteeProfileService } from './mentee-profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MenteeProfileController],
  providers: [MenteeProfileService, JwtAuthGuard],
})
export class MenteeProfileModule {}